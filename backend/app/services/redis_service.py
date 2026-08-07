import json
import logging
from typing import Optional, Dict, Any
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self, redis_url: str = settings.REDIS_URL):
        self.redis_url = redis_url
        self.client: Optional[aioredis.Redis] = None
        self._in_memory_cache: Dict[str, str] = {}
        self._in_memory_expire: Dict[str, float] = {}
        self.is_connected = False

    async def connect(self) -> None:
        """Initialize connection to Redis service."""
        try:
            self.client = aioredis.from_url(self.redis_url, decode_responses=True)
            # Test ping
            await self.client.ping()
            self.is_connected = True
            logger.info("Successfully connected to Redis.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis at {self.redis_url}. Using in-memory fallback. Error: {e}")
            self.is_connected = False
            self.client = None

    async def set_cache(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Cache a value with an expiration timer."""
        serialized = json.dumps(value)
        if self.is_connected and self.client:
            try:
                await self.client.set(key, serialized, ex=expire_seconds)
                return True
            except Exception as e:
                logger.error(f"Redis set_cache failed: {e}")
        
        # Fallback to in-memory
        import time
        self._in_memory_cache[key] = serialized
        self._in_memory_expire[key] = time.time() + expire_seconds
        return True

    async def get_cache(self, key: str) -> Optional[Any]:
        """Fetch a value from cache."""
        if self.is_connected and self.client:
            try:
                data = await self.client.get(key)
                if data:
                    return json.loads(data)
                return None
            except Exception as e:
                logger.error(f"Redis get_cache failed: {e}")

        # Fallback to in-memory
        import time
        if key in self._in_memory_cache:
            if time.time() < self._in_memory_expire.get(key, 0):
                return json.loads(self._in_memory_cache[key])
            else:
                # Clean up expired
                del self._in_memory_cache[key]
                if key in self._in_memory_expire:
                    del self._in_memory_expire[key]
        return None

    async def blacklist_token(self, jti: str, expire_seconds: int) -> bool:
        """Add a token identifier (JTI) to the JWT blacklist."""
        return await self.set_cache(f"blacklist:{jti}", "true", expire_seconds)

    async def is_token_blacklisted(self, jti: str) -> bool:
        """Check if a JWT token has been revoked."""
        val = await self.get_cache(f"blacklist:{jti}")
        return val is not None

    async def set_prediction_status(self, prediction_id: str, status_data: Dict[str, Any], expire_seconds: int = 86400) -> bool:
        """Temporarily store details of a running model execution."""
        return await self.set_cache(f"pred_status:{prediction_id}", status_data, expire_seconds)

    async def get_prediction_status(self, prediction_id: str) -> Optional[Dict[str, Any]]:
        """Fetch temporary prediction logs and statuses."""
        return await self.get_cache(f"pred_status:{prediction_id}")

    async def check_rate_limit(self, key: str, limit_max: int, window_seconds: int = 60) -> bool:
        """Check if rate limit is exceeded for a given client key."""
        rate_key = f"rate_limit:{key}"
        if self.is_connected and self.client:
            try:
                async with self.client.pipeline(transaction=True) as pipe:
                    # Increment request count, set expiry window if new
                    pipe.incr(rate_key)
                    pipe.expire(rate_key, window_seconds, nx=True)
                    res = await pipe.execute()
                    current_requests = res[0]
                    return current_requests <= limit_max
            except Exception as e:
                logger.error(f"Redis rate limiting pipeline error: {e}")

        # Fallback: Permit request when rate limiter has issues to avoid blocking users
        return True

redis_service = RedisService()
