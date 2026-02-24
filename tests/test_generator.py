import pytest
from pathlib import Path
from ezops.generator.engine import generate_files
from ezops.analyzer.models import StackInfo

def test_generate_python_fastapi(tmp_path: Path):
    stack = StackInfo(name="python", version="3.9", framework="fastapi")
    generate_files(str(tmp_path), stack)
    
    dockerfile = tmp_path / "Dockerfile"
    docker_compose = tmp_path / "docker-compose.yml"
    
    assert dockerfile.exists()
    assert docker_compose.exists()
    
    content = dockerfile.read_text()
    assert "uvicorn" in content
    assert "FROM python:3.9-slim" in content

def test_generate_node_nextjs(tmp_path: Path):
    stack = StackInfo(name="node", version="18", framework="nextjs")
    generate_files(str(tmp_path), stack)
    
    dockerfile = tmp_path / "Dockerfile"
    
    content = dockerfile.read_text()
    assert "COPY --from=builder /app/.next ./.next" in content
    assert "FROM node:18-alpine" in content
    assert "Multi-stage build" in content

def test_generate_go(tmp_path: Path):
    stack = StackInfo(name="go", version="1.20")
    generate_files(str(tmp_path), stack)
    
    dockerfile = tmp_path / "Dockerfile"
    assert "FROM golang:1.20-alpine AS builder" in dockerfile.read_text()
    assert "go build -a -installsuffix cgo" in dockerfile.read_text()

def test_generate_ruby_rails(tmp_path: Path):
    stack = StackInfo(name="ruby", version="3.2", framework="rails")
    generate_files(str(tmp_path), stack)
    
    dockerfile = tmp_path / "Dockerfile"
    docker_compose = tmp_path / "docker-compose.yml"
    assert "bundle install" in dockerfile.read_text()
    assert 'CMD ["rails", "server"' in dockerfile.read_text()
    assert '"3000:3000"' in docker_compose.read_text()

def test_generate_java_gradle(tmp_path: Path):
    stack = StackInfo(name="java", version="17", details={"build_tool": "gradle"})
    generate_files(str(tmp_path), stack)
    
    dockerfile = tmp_path / "Dockerfile"
    assert "FROM gradle:jdk17-alpine AS builder" in dockerfile.read_text()
    assert "gradle build --no-daemon" in dockerfile.read_text()
