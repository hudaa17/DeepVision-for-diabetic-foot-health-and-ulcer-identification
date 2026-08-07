import uuid
from contextvars import ContextVar
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# Context variable to hold correlation ID globally for the request context
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Check if client sent an existing tracking header
        corr_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        
        # Store in context variable
        token = correlation_id_ctx.set(corr_id)
        
        # Inject correlation ID into request state
        request.state.correlation_id = corr_id
        
        try:
            response = await call_next(request)
            # Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = corr_id
            return response
        finally:
            # Reset context var
            correlation_id_ctx.reset(token)
