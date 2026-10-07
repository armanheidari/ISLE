import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from app.routers import analysis
from app.core.config import settings
from app.models.schemas import ApiError, ApiHealth


app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

app.include_router(analysis.router)


@app.exception_handler(Exception)
async def handle_error(request, exc):
    logging.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


@app.get("/", response_model=ApiHealth)
async def api_info():
    """Root endpoint with API information"""
    return ApiHealth(
        status="healthy",
        message=f"Welcome to {settings.api_title} v{settings.api_version}"
    )


@app.get("/health", response_model=ApiHealth)
async def health_check():
    """Simple health check endpoint"""
    return ApiHealth(
        status="healthy",
        message="API is running"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)