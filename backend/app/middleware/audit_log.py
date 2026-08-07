import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)

class RequestAuditLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        if path == "/health" or path == "/metrics":
            return await call_next(request)
            
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        
        # Log request receipt
        logger.info(
            f"Incoming request: {method} {path}",
            extra={"extra_context": {
                "method": method,
                "path": path,
                "client_ip": client_ip,
                "user_agent": request.headers.get("user-agent", "")
            }}
        )
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log response details
            logger.info(
                f"Completed request: {method} {path} - {response.status_code} in {duration:.4f}s",
                extra={"extra_context": {
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "duration_seconds": duration
                }}
            )
            return response
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Unhandled exception during {method} {path}: {e}",
                exc_info=True,
                extra={"extra_context": {
                    "method": method,
                    "path": path,
                    "duration_seconds": duration
                }}
            )
            raise
