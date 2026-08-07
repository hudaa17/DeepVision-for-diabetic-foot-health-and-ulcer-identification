from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
from app.services.redis_service import redis_service
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Skip health checks or metrics endpoints to avoid blocking monitoring probes
        path = request.url.path
        if path == "/health" or path == "/metrics" or path.startswith("/docs") or path.startswith("/openapi"):
            return await call_next(request)
            
        # Get client IP address
        client_ip = request.client.host if request.client else "unknown_ip"
        
        # Check rate limit using Redis
        # Allow configurable limits, default to settings value
        limit_max = settings.RATE_LIMIT_PER_MINUTE
        allowed = await redis_service.check_rate_limit(client_ip, limit_max, window_seconds=60)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} on path {path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Too many requests. Please try again later.",
                    "ip": client_ip,
                    "limit": limit_max
                }
            )
            
        return await call_next(request)
