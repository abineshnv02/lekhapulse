class AIServiceError(Exception):
    """Base exception for AI categorization failures."""


class AIProviderError(AIServiceError):
    """Gemini/API/network-related failure that may be retried."""


class AIResponseError(AIServiceError):
    """Gemini returned an invalid or unusable response."""
