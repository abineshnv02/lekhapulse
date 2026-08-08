from ninja import NinjaAPI

api = NinjaAPI(
    title="LekhaPulse API",
    version="1.0.0",
    description="API for the LekhaPulse transaction intelligence platform.",
)


@api.get("/health")
def health_check(request):
    return {
        "status": "ok",
        "service": "lekhapulse-api",
    }
