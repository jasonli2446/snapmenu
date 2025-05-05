from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict
from app.core.ocr import extract_dishes_from_image, process_pdf
from app.core.enrichment import enrich_dishes

router = APIRouter()


@router.post("/extract-dishes")
async def extract_dishes(file: UploadFile = File(...)):
    contents = await file.read()

    # Check if the file is a PDF
    if file.filename.lower().endswith(".pdf"):
        raw_dishes = process_pdf(contents)
    else:
        raw_dishes = extract_dishes_from_image(contents)

    # Automatically enrich the dishes with AI processing
    enriched_dishes = enrich_dishes(raw_dishes)
    return {
        "dishes": raw_dishes,  # Original OCR results
        "enriched_dishes": enriched_dishes,  # AI-processed results
    }


class DishRequest(BaseModel):
    dishes: List[str]


@router.post("/enrich-dishes")
def enrich(dish_request: DishRequest):
    enriched = enrich_dishes(dish_request.dishes)
    return {"enriched_dishes": enriched}
