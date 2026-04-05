FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir ".[dev]"

EXPOSE 31847

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "31847"]
