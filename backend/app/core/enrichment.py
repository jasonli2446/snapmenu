from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from app.core.tags import ALL_TAGS, get_tag_category

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Keyword-based fallback for tagging
KEYWORD_TAGS = {
    "vegetarian": [
        "beyond",
        "impossible",
        "tofu",
        "paneer",
        "falafel",
        "veggie",
        "lentil",
        "mushroom",
    ],
    "vegan": ["vegan", "plant-based", "dairy-free", "egg-free"],
    "gluten-free": ["gluten-free", "no gluten"],
    "spicy": ["spicy", "hot", "chili", "pepper"],
    "contains-nuts": ["nut", "almond", "cashew", "peanut", "walnut"],
}


def assign_tags(description: str) -> list[str]:
    """Assign tags based on keywords in the description."""
    tags = []
    for tag, keywords in KEYWORD_TAGS.items():
        if any(keyword.lower() in description.lower() for keyword in keywords):
            tags.append(tag)
    return tags


def enrich_dishes(raw_lines: list[str]) -> list[dict]:
    # Create a comma-separated list of all possible tags for the prompt
    all_tags_str = ", ".join(ALL_TAGS)

    prompt = (
        "Extract a structured JSON list of dishes from the following menu lines.\n\n"
        + "\n".join(raw_lines)
        + "\n\nFor each dish, please provide:"
        + "\n1. name: The name of the dish"
        + "\n2. description: A brief description of what the dish is"
        + f"\n3. tags: An array of applicable tags from this list: [{all_tags_str}]"
        + "\n\nReturn JSON in the format: "
        + '[{"name": "Dish Name", "description": "Description of the dish", "tags": ["tag1", "tag2"]}]'
    )

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content
    print("GPT RESPONSE:", content)

    try:
        dishes = json.loads(content)
        # Apply keyword-based fallback tagging
        for dish in dishes:
            if "tags" not in dish:
                dish["tags"] = []
            dish["tags"].extend(assign_tags(dish.get("description", "")))
            # Remove duplicates
            dish["tags"] = list(set(dish["tags"]))
        return dishes
    except json.JSONDecodeError:
        return []
