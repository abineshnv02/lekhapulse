import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings",
)


import django

django.setup()

from ai.services.categorizer import GeminiCategorizer


categorizer = GeminiCategorizer()

result = categorizer.categorize(
    description="AWS monthly cloud hosting",
    amount=15000,
    currency="INR",
)

print("Category:", result.category)
print("Confidence:", result.confidence)
