from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict
from app.core.ocr import extract_dishes_from_image
from app.core.enrichment import enrich_dishes

router = APIRouter()


@router.post("/extract-dishes")
async def extract_dishes(file: UploadFile = File(...)):
    contents = await file.read()
    dishes = extract_dishes_from_image(contents)
    return {"dishes": dishes}


class DishRequest(BaseModel):
    dishes: List[str]


@router.post("/enrich-dishes")
def enrich(dish_request: DishRequest):
    enriched = enrich_dishes(dish_request.dishes)
    return {"enriched_dishes": enriched}
