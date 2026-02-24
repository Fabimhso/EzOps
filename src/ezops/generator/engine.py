from pathlib import Path
from ezops.analyzer.models import StackInfo
from rich.console import Console

console = Console()

# Templates Base (Otimizados e Seguros)
DOCKERFILE_PYTHON_BASE = """# Base image
FROM python:{version}-slim AS builder

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
"""

DOCKERFILE_NODE_BASE = """# Multi-stage build para Node.js
FROM node:{version}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build 

FROM node:{version}-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 

# Otimização Node.js
ENV NODE_ENV=production

# Non-root user
USER node

EXPOSE 3000
CMD ["npm", "start"]
"""

DOCKER_COMPOSE_BASE = """version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
"""

DOCKERFILE_GO_BASE = """# Multi-stage build para Go
FROM golang:{version}-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
"""

DOCKERFILE_JAVA_MAVEN_BASE = """# Multi-stage build para Java (Maven)
FROM maven:3.9-eclipse-temurin-{version}-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:{version}-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
"""

DOCKERFILE_JAVA_GRADLE_BASE = """# Multi-stage build para Java (Gradle)
FROM gradle:jdk{version}-alpine AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src src

RUN gradle build --no-daemon -x test

FROM eclipse-temurin:{version}-jre-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
"""

DOCKERFILE_RUBY_BASE = """# Base image para Ruby
FROM ruby:{version}-slim AS base

WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 4567
CMD ["ruby", "app.rb"]
"""

def generate_dockerfile(path: Path, stack: StackInfo):
    file_path = path / "Dockerfile"
    if file_path.exists():
        console.print("[yellow]⚠️ Dockerfile já existe! Pulando criação...[/yellow]")
        return
        
    content = ""
    if stack.name == "python":
        content = DOCKERFILE_PYTHON_BASE.format(version=stack.version or "3.9")
        # Se for FastAPI
        if stack.framework == "fastapi":
            content = content.replace('CMD ["python", "main.py"]', 'CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]')
    elif stack.name == "node":
        content = DOCKERFILE_NODE_BASE.format(version=stack.version or "18")
        if stack.framework == "nextjs":
            content = content.replace('COPY --from=builder /app/dist ./dist', 'COPY --from=builder /app/.next ./.next')
    elif stack.name == "go":
        content = DOCKERFILE_GO_BASE.format(version=stack.version or "1.20")
    elif stack.name == "java":
        build_tool = stack.details.get("build_tool", "maven")
        if build_tool == "maven":
            content = DOCKERFILE_JAVA_MAVEN_BASE.format(version=stack.version or "17")
        else:
            content = DOCKERFILE_JAVA_GRADLE_BASE.format(version=stack.version or "17")
    elif stack.name == "ruby":
        content = DOCKERFILE_RUBY_BASE.format(version=stack.version or "3.2")
        if stack.framework == "rails":
            content = content.replace('CMD ["ruby", "app.rb"]', 'CMD ["rails", "server", "-b", "0.0.0.0"]')
            content = content.replace('EXPOSE 4567', 'EXPOSE 3000')
            
    file_path.write_text(content)
    console.print(f"[green]🐳 Dockerfile ({stack.name}) gerado com sucesso![/green]")

def generate_docker_compose(path: Path, stack: StackInfo):
    file_path = path / "docker-compose.yml"
    if file_path.exists():
        console.print("[yellow]⚠️ docker-compose.yml já existe! Pulando criação...[/yellow]")
        return
        
    ports_map = {
        "python": "8000",
        "node": "3000",
        "go": "8080",
        "java": "8080",
        "ruby": "4567" if stack.framework != "rails" else "3000"
    }
    
    port = ports_map.get(stack.name, "8080")
    content = DOCKER_COMPOSE_BASE.format(port=port)
    
    file_path.write_text(content)
    console.print("[green]🐙 docker-compose.yml gerado com sucesso![/green]")

def generate_files(path_str: str, stack: StackInfo):
    """Orquestra a geração de todos os arquivos necessários."""
    path = Path(path_str)
    generate_dockerfile(path, stack)
    generate_docker_compose(path, stack)
