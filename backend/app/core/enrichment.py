from openai import OpenAI
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def enrich_dishes(raw_lines: list[str]) -> list[dict]:
    prompt = (
        "Extract a structured JSON list of dishes (name and description) from the following menu lines:\n\n"
        + "\n".join(raw_lines)
        + '\n\nReturn JSON in the format: [{"name": "...", "description": "..."}, ...]'
    )

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content
    print("GPT RESPONSE:", content)

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return []
