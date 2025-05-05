import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("SERP_API_KEY")


def search_dish_image(dish_name: str) -> str:
    search_query = f"{dish_name} food photo"

    url = "https://serpapi.com/search.json"
    params = {
        "q": search_query,
        "tbm": "isch",  # image search
        "api_key": API_KEY,
        "num": 1,
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        results = data.get("images_results", [])
        if results:
            return results[0].get("original", "")
        return ""
    except Exception as e:
        print(f"[ImageSearch] Error for '{dish_name}': {e}")
        return ""
