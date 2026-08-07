import boto3
from botocore.exceptions import ClientError
from app.services.storage.base import BaseStorage
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class S3Storage(BaseStorage):
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_BUCKET_NAME

    async def upload_file(self, file_data: bytes, storage_key: str, content_type: str = "application/octet-stream") -> str:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_key,
                Body=file_data,
                ContentType=content_type
            )
            return storage_key
        except ClientError as e:
            logger.error(f"S3 upload error for {storage_key}: {e}")
            raise RuntimeError(f"Failed to upload file to S3: {e}")

    async def download_file(self, storage_key: str) -> bytes:
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=storage_key)
            return response["Body"].read()
        except ClientError as e:
            logger.error(f"S3 download error for {storage_key}: {e}")
            raise FileNotFoundError(f"File not found in S3: {storage_key}")

    async def delete_file(self, storage_key: str) -> bool:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except ClientError as e:
            logger.error(f"S3 delete error for {storage_key}: {e}")
            return False

    async def get_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        try:
            return self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": storage_key},
                ExpiresIn=expires_in
            )
        except ClientError as e:
            logger.error(f"S3 presign error for {storage_key}: {e}")
            return f"/api/v1/predictions/files/{storage_key}"
