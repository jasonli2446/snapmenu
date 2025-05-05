from enum import Enum
from typing import List, Dict, Any


class TagCategory(str, Enum):
    DIETARY = "dietary"
    SPICE = "spice"
    ALLERGEN = "allergen"
    MEAL_TYPE = "meal_type"
    SPECIAL = "special"


# Dictionary mapping tag categories to their possible values
TAG_DEFINITIONS = {
    TagCategory.DIETARY: [
        "vegetarian",
        "vegan",
        "gluten-free",
        "dairy-free",
        "keto",
        "low-carb",
        "halal",
        "kosher",
    ],
    TagCategory.SPICE: ["mild", "medium", "spicy", "very-spicy"],
    TagCategory.ALLERGEN: [
        "contains-nuts",
        "contains-dairy",
        "contains-shellfish",
        "contains-eggs",
        "contains-soy",
        "contains-wheat",
    ],
}

# Flattened list of all possible tags for validation
ALL_TAGS = [tag for tags in TAG_DEFINITIONS.values() for tag in tags]


def get_tag_category(tag: str) -> str:
    """Returns the category of a given tag"""
    for category, tags in TAG_DEFINITIONS.items():
        if tag in tags:
            return category
    return None
