from PIL import Image, ImageFilter, ImageEnhance
from pdf2image import convert_from_bytes
import pytesseract
import io
import cv2
import numpy as np
import re
import os


def process_pdf(pdf_bytes: bytes) -> list[str]:
    """Extract text from a PDF menu"""
    try:
        images = convert_from_bytes(pdf_bytes)
        all_dishes = []

        for image in images:
            # Convert PIL image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format="PNG")
            img_bytes = img_byte_arr.getvalue()

            # Process each page
            dishes = extract_dishes_from_image(img_bytes)
            all_dishes.extend(dishes)

        return all_dishes
    except Exception as e:
        print(f"PDF processing error: {e}")
        return []


def extract_dishes_from_image(image_bytes: bytes) -> list[str]:
    """Extract dishes from image with enhanced preprocessing and filtering"""
    try:
        # Try multiple OCR strategies and combine results
        dishes = []

        # Strategy 1: Standard preprocessing
        dishes.extend(standard_ocr_approach(image_bytes))

        # Strategy 2: Enhanced contrast preprocessing
        dishes.extend(enhanced_contrast_approach(image_bytes))

        # Remove duplicates but preserve order
        unique_dishes = []
        seen = set()
        for dish in dishes:
            if dish not in seen:
                seen.add(dish)
                unique_dishes.append(dish)

        # Further filter and clean the dishes
        cleaned_dishes = clean_menu_items(unique_dishes)

        # If no dishes found, try rotation correction
        if not cleaned_dishes:
            rotated_dishes = try_rotation_correction(image_bytes)
            cleaned_dishes = clean_menu_items(rotated_dishes)

        return cleaned_dishes
    except Exception as e:
        print(f"OCR extraction error: {e}")
        return []


def standard_ocr_approach(image_bytes: bytes) -> list[str]:
    """Standard OCR approach with denoising"""
    # Convert bytes to OpenCV format
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    # Check if image loaded properly
    if image is None:
        print("Failed to load image")
        return []

    # Apply preprocessing to enhance text visibility
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding to handle varying lighting conditions
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Denoise the image
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)

    # Convert back to PIL format for pytesseract
    pil_image = Image.fromarray(denoised)

    # Try multiple PSM modes for better results
    results = []

    # PSM 4 - Assume a single column of text of variable sizes
    custom_config = r"--oem 3 --psm 4 -l eng"
    raw_text = pytesseract.image_to_string(pil_image, config=custom_config)
    results.extend([line.strip() for line in raw_text.split("\n") if line.strip()])

    # PSM 6 - Assume a single uniform block of text
    custom_config = r"--oem 3 --psm 6 -l eng"
    raw_text = pytesseract.image_to_string(pil_image, config=custom_config)
    results.extend([line.strip() for line in raw_text.split("\n") if line.strip()])

    return results


def enhanced_contrast_approach(image_bytes: bytes) -> list[str]:
    """OCR approach with enhanced contrast"""
    # Convert bytes to OpenCV format
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if image is None:
        return []

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Sharpen the image
    kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)

    # Binarize
    _, binary = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Convert to PIL for tesseract
    pil_image = Image.fromarray(binary)

    # Use PSM 11 (sparse text - find as much text as possible)
    custom_config = r"--oem 3 --psm 11 -l eng"
    raw_text = pytesseract.image_to_string(pil_image, config=custom_config)

    return [line.strip() for line in raw_text.split("\n") if line.strip()]


def try_rotation_correction(image_bytes: bytes) -> list[str]:
    """Try rotating the image to find text"""
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if image is None:
        return []

    results = []

    # Try different rotations
    for angle in [90, 180, 270]:
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
        )

        # Convert to grayscale
        gray = cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY)

        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )

        # Convert to PIL for tesseract
        pil_image = Image.fromarray(thresh)

        # Use PSM 4 - Assume a single column of text of variable sizes
        custom_config = r"--oem 3 --psm 4 -l eng"
        raw_text = pytesseract.image_to_string(pil_image, config=custom_config)

        results.extend([line.strip() for line in raw_text.split("\n") if line.strip()])

    return results


def clean_menu_items(lines: list[str]) -> list[str]:
    """Apply more sophisticated filtering for menu items"""
    # Compile common patterns
    price_pattern = re.compile(r"^\s*\$?\d+\.?\d*\s*$|.*\$\d+\.?\d*.*")
    menu_item_pattern = re.compile(r"^[A-Z][\w\s\-\',.]+")

    dishes = []
    dish_descriptions = {}
    current_dish = None

    for i, line in enumerate(lines):
        # Skip very short lines
        if len(line) < 3:
            continue

        # Skip lines that are just prices
        if price_pattern.match(line) and len(line) < 10:
            continue

        # Skip lines that are mostly numbers or punctuation
        if sum(c.isalpha() for c in line) < len(line) * 0.3:
            continue

        # Skip common non-food lines
        if any(
            keyword in line.lower()
            for keyword in [
                "open",
                "close",
                "hour",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
                "wifi",
                "password",
                "www",
                ".com",
                "reservation",
                "phone",
                "call",
                "email",
            ]
        ):
            continue

        # Check if this line looks like a dish name
        if menu_item_pattern.match(line) and not line.lower().startswith("the "):
            current_dish = line
            dishes.append(current_dish)
        elif current_dish and i > 0:
            if current_dish in dish_descriptions:
                dish_descriptions[current_dish] += " " + line
            else:
                dish_descriptions[current_dish] = line

    # Filter again for quality
    filtered_dishes = [
        dish
        for dish in dishes
        if len(dish) > 5 and sum(c.isalpha() for c in dish) > len(dish) * 0.5
    ]

    return filtered_dishes
