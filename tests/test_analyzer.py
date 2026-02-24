import pytest
from pathlib import Path
from ezops.analyzer.engine import analyze_directory
from ezops.analyzer.models import StackInfo

def test_analyze_python_fastapi(tmp_path: Path):
    req_file = tmp_path / "requirements.txt"
    req_file.write_text("fastapi==0.95.0\nuvicorn==0.21.1\n")
    
    stack = analyze_directory(str(tmp_path))
    assert stack is not None
    assert stack.name == "python"
    assert stack.framework == "fastapi"

def test_analyze_node_nextjs(tmp_path: Path):
    pkg_file = tmp_path / "package.json"
    pkg_file.write_text('{"dependencies": {"next": "^13.0.0", "react": "^18.2.0"}}')
    
    stack = analyze_directory(str(tmp_path))
    assert stack is not None
    assert stack.name == "node"
    assert stack.framework == "nextjs"

def test_analyze_unknown_project(tmp_path: Path):
    # Diretório vazio
    stack = analyze_directory(str(tmp_path))
    assert stack is None

def test_analyze_go(tmp_path: Path):
    (tmp_path / "go.mod").write_text("module example/app\ngo 1.20")
    stack = analyze_directory(str(tmp_path))
    assert stack.name == "go"

def test_analyze_java_maven(tmp_path: Path):
    (tmp_path / "pom.xml").write_text("<project></project>")
    stack = analyze_directory(str(tmp_path))
    assert stack.name == "java"
    assert stack.details["build_tool"] == "maven"

def test_analyze_ruby(tmp_path: Path):
    (tmp_path / "Gemfile").write_text("source 'https://rubygems.org'\ngem 'rails'")
    stack = analyze_directory(str(tmp_path))
    assert stack.name == "ruby"
    assert stack.framework == "rails"
