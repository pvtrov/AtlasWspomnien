import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings

logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.exception_handler(RequestValidationError)
    async def handle_request_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        logger.warning(
            "Request validation failed: method=%s path=%s query=%s errors=%s",
            request.method,
            request.url.path,
            str(request.url.query),
            exc.errors(),
        )
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
        )

    application.include_router(api_router, prefix=settings.api_prefix)
    return application


app = create_application()
