import json
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from django.conf import settings
from google import genai

from ai.exceptions.categorization import (
    AIProviderError,
    AIResponseError,
)


@dataclass(frozen=True)
class CategoryResult:
    category: str
    confidence: Decimal


class GeminiCategorizer:
    MODEL = "gemini-3.1-flash-lite"

    def __init__(self) -> None:
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    def categorize(
        self,
        *,
        description: str,
        amount: Decimal,
        currency: str,
    ) -> CategoryResult:
        prompt = f"""
You are an accounting transaction categorization assistant.

Categorize the following business transaction.

Description: {description}
Amount: {amount}
Currency: {currency}

Return ONLY valid JSON with exactly these fields:

{{
    "category": "string",
    "confidence": 0.0
}}

Rules:

- category must be a concise accounting category.
- confidence must be a number between 0.0 and 1.0.
- Do not include markdown.
- Do not include explanations.
"""

        try:
            response = self.client.models.generate_content(
                model=self.MODEL,
                contents=prompt,
            )
        except Exception as exc:
            raise AIProviderError(
                "Gemini provider request failed."
            ) from exc

        try:
            text = response.text.strip()
            data = json.loads(text)

            category = str(data["category"]).strip()
            confidence = Decimal(str(data["confidence"]))

        except (
            AttributeError,
            KeyError,
            TypeError,
            json.JSONDecodeError,
            InvalidOperation,
        ) as exc:
            raise AIResponseError(
                "Gemini returned an invalid categorization response."
            ) from exc

        if not category:
            raise AIResponseError(
                "Gemini returned an empty category."
            )

        if not Decimal("0") <= confidence <= Decimal("1"):
            raise AIResponseError(
                "Gemini returned an invalid confidence score."
            )

        return CategoryResult(
            category=category,
            confidence=confidence,
        )
