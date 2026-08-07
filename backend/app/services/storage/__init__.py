from app.core.config import settings
from app.services.storage.local import LocalStorage

# Lazy instantiation of storage classes depending on active provider
storage_service = None

if settings.STORAGE_PROVIDER == "s3":
    try:
        from app.services.storage.s3 import S3Storage
        storage_service = S3Storage()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to initialize S3 storage, falling back to local: {e}")
        storage_service = LocalStorage()
elif settings.STORAGE_PROVIDER == "azure":
    try:
        from app.services.storage.azure import AzureBlobStorage
        storage_service = AzureBlobStorage()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to initialize Azure storage, falling back to local: {e}")
        storage_service = LocalStorage()

if storage_service is None:
    storage_service = LocalStorage()
