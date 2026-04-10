# MOZART Telegram Bot — Dockerfile
# python-telegram-bot 21.x (async, long-polling)

FROM python:3.12-slim

# Prevent .pyc files and enable unbuffered stdout/stderr for clean Docker logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source last so code changes don't bust the pip cache layer
COPY main.py .

# Run as non-root for reduced attack surface
RUN adduser --disabled-password --gecos "" botuser \
    && chown -R botuser:botuser /app
USER botuser

CMD ["python", "main.py"]
