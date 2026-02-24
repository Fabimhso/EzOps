# Base image
FROM python:3.9-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar projeto
COPY . .

# Non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Expondo a porta default (Ajuste se necessário)
EXPOSE 8000

# Comando padrão
CMD ["python", "main.py"]
