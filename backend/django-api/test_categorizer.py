import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings",
)

import django

django.setup()

from transactions.ai.gemini import GeminiCategorizer


categorizer = GeminiCategorizer()

result = categorizer.categorize(
    description="AWS cloud hosting",
    amount="15000.00",
    currency="INR",
)

print("Category:", result.category)
print("Confidence:", result.confidence)
