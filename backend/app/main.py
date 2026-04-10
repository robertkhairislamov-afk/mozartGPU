from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, billing, gpus, instances, ssh_keys

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
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(gpus.router, prefix="/api/v1/gpus", tags=["GPUs"])
app.include_router(instances.router, prefix="/api/v1/instances", tags=["Instances"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(ssh_keys.router, prefix="/api/v1/ssh-keys", tags=["SSH Keys"])


@app.get("/api/v1/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok", "version": "0.2.0"}
