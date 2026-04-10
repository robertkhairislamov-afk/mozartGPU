import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, billing, gpus, instances, ssh_keys
from app.routers.gpu_models import router as gpu_models_router, seed_gpu_models
from app.worker import start_background_workers

logger = logging.getLogger(__name__)

app = FastAPI(
    title="MOZART GPU API",
    version="0.2.0",
    description="GPU rental platform API — resale via vast.ai",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mozartgpu.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(gpus.router, prefix="/api/v1/gpus", tags=["GPUs"])
app.include_router(gpu_models_router, prefix="/api/v1/gpu-models", tags=["GPU Models"])
app.include_router(instances.router, prefix="/api/v1/instances", tags=["Instances"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(ssh_keys.router, prefix="/api/v1/ssh-keys", tags=["SSH Keys"])

_worker_tasks: list[asyncio.Task] = []


@app.on_event("startup")
async def on_startup() -> None:
    await seed_gpu_models()
    global _worker_tasks
    _worker_tasks = start_background_workers()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    for task in _worker_tasks:
        task.cancel()
    if _worker_tasks:
        await asyncio.gather(*_worker_tasks, return_exceptions=True)
    logger.info("Background workers stopped")


@app.get("/api/v1/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "version": "0.2.0"}
