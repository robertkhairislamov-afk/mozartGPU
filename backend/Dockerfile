# MOZART Auto-Provision Webhook — Dockerfile
# FastAPI + uvicorn, port 8081

FROM python:3.12-slim

# Prevent .pyc files and enable unbuffered stdout/stderr for clean Docker logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source last so code changes don't bust the pip cache layer
COPY auto_provision.py .

# Run as non-root for reduced attack surface
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

# PROVISION_WEBHOOK_PORT default matches .env.example default
EXPOSE 8081

# uvicorn with a single worker is sufficient for this low-throughput webhook service.
# Access log retained for financial audit trail.
CMD ["uvicorn", "auto_provision:app", "--host", "0.0.0.0", "--port", "8081"]
