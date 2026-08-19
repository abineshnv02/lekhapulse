from ninja import NinjaAPI

from config.auth.ninja_auth import JWTAuth

from config.api.auth.routes import (
    router as auth_router,
)
from config.api.clients.routes import (
    router as clients_router,
)
from config.api.transactions.routes import (
    router as transactions_router,
)
from config.api.dashboard.routes import (
    router as dashboard_router,
)
from config.api.team.routes import (
    router as team_router,
)
from config.api.audit.routes import (
    router as audit_router,
)


api = NinjaAPI(
    title="LekhaPulse API",
    version="1.0.0",
    auth=JWTAuth(),
)


@api.get(
    "/health",
    auth=None,
)
def health_check(request):
    return {
        "status": "ok",
    }


api.add_router(
    "/auth/",
    auth_router,
)

api.add_router(
    "/clients/",
    clients_router,
)

api.add_router(
    "/transactions/",
    transactions_router,
)

api.add_router(
    "/dashboard/",
    dashboard_router,
)

api.add_router(
    "/team/",
    team_router,
)

api.add_router(
    "/audit/",
    audit_router,
)
