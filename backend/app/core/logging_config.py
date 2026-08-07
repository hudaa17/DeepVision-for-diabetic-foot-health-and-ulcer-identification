import json
import logging
import sys
from typing import Any

class StructuredJSONFormatter(logging.Formatter):
    """Custom logging formatter that outputs records as JSON strings."""
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "filename": record.filename,
            "lineno": record.lineno,
        }
        
        # Include correlation ID from tracing middleware context variable
        try:
            from app.middleware.trace import correlation_id_ctx
            corr_id = correlation_id_ctx.get()
            if corr_id:
                log_record["correlation_id"] = corr_id
        except ImportError:
            pass
            
        # Add exception details if present
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        # Merge extra context if provided
        if hasattr(record, "extra_context") and isinstance(record.extra_context, dict):
            log_record.update(record.extra_context)
            
        return json.dumps(log_record)

def setup_logging(log_level: str = "INFO") -> None:
    """Configure standard Python loggers to output structured JSON."""
    root_logger = logging.getLogger()
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        
    # Configure console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(StructuredJSONFormatter())
    
    root_logger.addHandler(console_handler)
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # Silence third-party library loggers if needed
    logging.getLogger("uvicorn.access").handlers = [console_handler]
    logging.getLogger("uvicorn.error").handlers = [console_handler]
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
