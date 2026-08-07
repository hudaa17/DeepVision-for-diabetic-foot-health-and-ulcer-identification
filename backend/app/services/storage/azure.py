from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta, timezone
from app.services.storage.base import BaseStorage
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class AzureBlobStorage(BaseStorage):
    def __init__(self):
        self.blob_service_client = BlobServiceClient.from_connection_string(
            settings.AZURE_STORAGE_CONNECTION_STRING
        )
        self.container_name = settings.AZURE_CONTAINER_NAME
        self.container_client = self.blob_service_client.get_container_client(self.container_name)

    async def upload_file(self, file_data: bytes, storage_key: str, content_type: str = "application/octet-stream") -> str:
        try:
            blob_client = self.container_client.get_blob_client(storage_key)
            blob_client.upload_blob(file_data, overwrite=True, content_settings={"content_type": content_type})
            return storage_key
        except Exception as e:
            logger.error(f"Azure upload error for {storage_key}: {e}")
            raise RuntimeError(f"Failed to upload file to Azure Blob: {e}")

    async def download_file(self, storage_key: str) -> bytes:
        try:
            blob_client = self.container_client.get_blob_client(storage_key)
            return blob_client.download_blob().readall()
        except Exception as e:
            logger.error(f"Azure download error for {storage_key}: {e}")
            raise FileNotFoundError(f"File not found in Azure: {storage_key}")

    async def delete_file(self, storage_key: str) -> bool:
        try:
            blob_client = self.container_client.get_blob_client(storage_key)
            blob_client.delete_blob()
            return True
        except Exception as e:
            logger.error(f"Azure delete error for {storage_key}: {e}")
            return False

    async def get_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        try:
            blob_client = self.container_client.get_blob_client(storage_key)
            # Generate Shared Access Signature (SAS) token
            sas_token = generate_blob_sas(
                account_name=self.blob_service_client.account_name,
                container_name=self.container_name,
                blob_name=storage_key,
                account_key=self.blob_service_client.credential.account_key,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.now(timezone.utc) + timedelta(seconds=expires_in)
            )
            return f"{blob_client.url}?{sas_token}"
        except Exception as e:
            logger.error(f"Azure SAS generation error for {storage_key}: {e}")
            return f"/api/v1/predictions/files/{storage_key}"
