from fastapi import UploadFile
import pytesseract
from PIL import Image as PILImage
import io

def analyze_image_from_path(path: str):
    with open(path, "rb") as f:
        pil_img = PILImage.open(f)
        text = pytesseract.image_to_string(pil_img)
        tags = ", ".join(set(text.strip().split()))
    return text, tags