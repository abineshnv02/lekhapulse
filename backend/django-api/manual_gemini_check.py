import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings",
)

import django

django.setup()

from django.conf import settings
from google import genai


client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
)

response = client.models.generate_content(
    model="gemini-3.1-flash-lite",
    contents=(
        "Categorize this accounting transaction.\n\n"
        "Description: AWS cloud hosting\n"
        "Amount: 15000 INR\n"
        "Currency: INR\n\n"
        "Return only the most appropriate accounting category."
    ),
)

print(response.text)
