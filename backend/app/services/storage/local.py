import os
import shutil
from app.services.storage.base import BaseStorage
from app.core.config import settings

class LocalStorage(BaseStorage):
    def __init__(self, base_dir: str = settings.LOCAL_STORAGE_DIR):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_absolute_path(self, storage_key: str) -> str:
        # Standardize path separators and avoid path traversal attacks
        cleaned_key = str(storage_key).strip().lstrip("/\\").replace("\\", "/")
        dest_path = os.path.abspath(os.path.join(self.base_dir, cleaned_key))
        if not dest_path.lower().startswith(self.base_dir.lower()):
            raise PermissionError(f"Access denied: path traversal detected for key {storage_key}")
        return dest_path

    async def upload_file(self, file_data: bytes, storage_key: str, content_type: str = "application/octet-stream") -> str:
        dest_path = self._get_absolute_path(storage_key)
        # Ensure directories exist
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        with open(dest_path, "wb") as f:
            f.write(file_data)
        return storage_key

    async def download_file(self, storage_key: str) -> bytes:
        src_path = self._get_absolute_path(storage_key)
        if not os.path.exists(src_path):
            raise FileNotFoundError(f"File not found in storage: {storage_key}")
            
        with open(src_path, "rb") as f:
            return f.read()

    async def delete_file(self, storage_key: str) -> bool:
        src_path = self._get_absolute_path(storage_key)
        if os.path.exists(src_path):
            os.remove(src_path)
            return True
        return False

    async def get_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        # For local files, we return a local API endpoint URL that maps to a static file server or a download API
        return f"/api/v1/predictions/files/{storage_key}"
