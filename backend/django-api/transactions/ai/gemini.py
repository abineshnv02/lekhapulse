from django.conf import settings
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from transactions.ai.categorizer import TransactionCategory


class GeminiCategorizationResult(BaseModel):
    category: TransactionCategory = Field(
        description="The most appropriate accounting category.",
    )
    confidence: float = Field(
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1.",
    )


class GeminiCategorizer:
    MODEL = "gemini-3.1-flash-lite"

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
        )

    def categorize(
        self,
        *,
        description: str,
        amount: str,
        currency: str,
    ) -> GeminiCategorizationResult:
        categories = "\n".join(
            f"- {category.value}"
            for category in TransactionCategory
        )

        prompt = f"""
You are an accounting transaction categorization assistant.

Choose exactly ONE category from the allowed categories below.

Allowed categories:
{categories}

Transaction:
Description: {description}
Amount: {amount}
Currency: {currency}

Rules:
- Choose the single most appropriate category.
- Do not invent a new category.
- Consider the transaction description and amount.
- Return a confidence score between 0 and 1.
"""

        response = self.client.models.generate_content(
            model=self.MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiCategorizationResult,
            ),
        )

        return GeminiCategorizationResult.model_validate_json(
            response.text,
        )
