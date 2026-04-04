from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


class PhotoStorageService:
    def __init__(self, storage_root: Path) -> None:
        self.storage_root = storage_root

    def save_photo(self, *, owner_id: int, upload_file: UploadFile) -> str:
        extension = self._detect_extension(upload_file)
        generated_name = f"{uuid4().hex}{extension}"
        relative_path = Path("photos") / str(owner_id) / generated_name
        destination = self.storage_root / str(owner_id) / generated_name

        destination.parent.mkdir(parents=True, exist_ok=True)

        upload_file.file.seek(0)
        with destination.open("wb") as output_file:
            while chunk := upload_file.file.read(1024 * 1024):
                output_file.write(chunk)

        return relative_path.as_posix()

    def delete_photo(self, file_reference: str) -> None:
        reference_path = Path(file_reference)
        if reference_path.parts[:1] != ("photos",):
            return

        relative_storage_path = Path(*reference_path.parts[1:])
        destination = self.storage_root / relative_storage_path
        if destination.exists():
            destination.unlink()

    @staticmethod
    def _detect_extension(upload_file: UploadFile) -> str:
        filename = upload_file.filename or ""
        extension = Path(filename).suffix.lower()
        if extension:
            return extension

        content_type_extensions = {
            "image/gif": ".gif",
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }
        return content_type_extensions.get(upload_file.content_type or "", ".bin")
