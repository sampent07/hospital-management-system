from fastapi import APIRouter
from app.api.v1 import (
    auth_router,
    visit_router,
    queue_router,
    route_router,
    service_order_router,
    package_router,
    admin_router,
    health_router,
)

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(auth_router.router)
api_router.include_router(visit_router.router)
api_router.include_router(queue_router.router)
api_router.include_router(route_router.router)
api_router.include_router(service_order_router.router)
api_router.include_router(package_router.router)
api_router.include_router(admin_router.router)
