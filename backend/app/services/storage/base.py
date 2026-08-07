import abc

class BaseStorage(abc.ABC):
    @abc.abstractmethod
    async def upload_file(self, file_data: bytes, storage_key: str, content_type: str = "application/octet-stream") -> str:
        """Upload file_data to the storage backend and return the storage path/key."""
        pass

    @abc.abstractmethod
    async def download_file(self, storage_key: str) -> bytes:
        """Download file content from the storage backend."""
        pass

    @abc.abstractmethod
    async def delete_file(self, storage_key: str) -> bool:
        """Delete a file from the storage backend."""
        pass

    @abc.abstractmethod
    async def get_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        """Get a temporary public URL for access."""
        pass
