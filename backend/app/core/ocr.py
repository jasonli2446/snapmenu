from PIL import Image
import pytesseract
import io


def extract_dishes_from_image(image_bytes: bytes) -> list[str]:
    image = Image.open(io.BytesIO(image_bytes))
    raw_text = pytesseract.image_to_string(image)
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    dishes = [line for line in lines if not any(char in line for char in "$0123456789")]
    return dishes
