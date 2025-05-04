from fastapi import APIRouter, UploadFile, File
from app.core.ocr import extract_dishes_from_image

router = APIRouter()


@router.post("/extract-dishes")
async def extract_dishes(file: UploadFile = File(...)):
    contents = await file.read()
    dishes = extract_dishes_from_image(contents)
    return {"dishes": dishes}
