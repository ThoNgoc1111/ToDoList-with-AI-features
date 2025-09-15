import os
from fastapi import UploadFile

def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    with open(destination, "wb") as out_file:
        upload_file.file.seek(0)
        out_file.write(upload_file.file.read())
    return destination