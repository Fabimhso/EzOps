import os
import json
from pathlib import Path
from .models import StackInfo

def _analyze_python(path: Path) -> StackInfo:
    """Heurística para projetos Python"""
    req_file = path / "requirements.txt"
    pyproject_file = path / "pyproject.toml"
    
    framework = None
    
    if req_file.exists():
        content = req_file.read_text().lower()
        if "fastapi" in content:
            framework = "fastapi"
        elif "django" in content:
            framework = "django"
        elif "flask" in content:
            framework = "flask"
            
    # TODO: Analisar pyproject.toml para heurísticas mais modernas
    
    return StackInfo(
        name="python",
        version="3.9", # Fallback default 
        framework=framework
    )

def _analyze_node(path: Path) -> StackInfo:
    """Heurística para projetos Node.js"""
    package_json = path / "package.json"
    framework = None
    
    if package_json.exists():
        try:
            data = json.loads(package_json.read_text())
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})
            all_deps = {**deps, **dev_deps}
            
            if "next" in all_deps:
                framework = "nextjs"
            elif "express" in all_deps:
                framework = "express"
            elif "nestjs" in all_deps:
                framework = "nestjs"
        except json.JSONDecodeError:
            pass
            
    return StackInfo(
        name="node",
        version="18", # Fallback default
        framework=framework
    )

def _analyze_go(path: Path) -> StackInfo:
    """Heurística para projetos Go"""
    return StackInfo(
        name="go",
        version="1.20"
    )

def _analyze_java(path: Path) -> StackInfo:
    """Heurística para projetos Java (Maven/Gradle)"""
    framework = None
    
    has_pom = (path / "pom.xml").exists()
    has_gradle = (path / "build.gradle").exists()
    
    if has_pom and (path / "pom.xml").read_text(errors='ignore').find("spring-boot") != -1:
        framework = "spring"
    elif has_gradle and (path / "build.gradle").read_text(errors='ignore').find("spring-boot") != -1:
        framework = "spring"

    # Detectar Build Tool
    build_tool = "maven"
    if has_gradle or (path / "build.gradle.kts").exists():
        build_tool = "gradle"
        
    return StackInfo(
        name="java",
        version="17",
        framework=framework,
        details={"build_tool": build_tool}
    )

def _analyze_ruby(path: Path) -> StackInfo:
    """Heurística para projetos Ruby"""
    framework = None
    gemfile = path / "Gemfile"
    
    if gemfile.exists():
        content = gemfile.read_text(errors='ignore').lower()
        if "gem 'rails'" in content or 'gem "rails"' in content:
            framework = "rails"
        elif "gem 'sinatra'" in content or 'gem "sinatra"' in content:
            framework = "sinatra"
            
    return StackInfo(
        name="ruby",
        version="3.2",
        framework=framework
    )

def analyze_directory(directory_path: str) -> StackInfo:
    """
    Analisa o diretório informado e retorna informações sobre a stack.
    Retorna None se não for possível detectar a stack.
    """
    path = Path(directory_path)
    
    if not path.exists() or not path.is_dir():
        return None
        
    # Heurística Node.js
    if (path / "package.json").exists():
        return _analyze_node(path)
        
    # Heurística Python
    if (path / "requirements.txt").exists() or (path / "pyproject.toml").exists() or list(path.glob("*.py")):
        return _analyze_python(path)
        
    # Heurística Go
    if (path / "go.mod").exists() or list(path.glob("*.go")):
        return _analyze_go(path)
        
    # Heurística Java
    if (path / "pom.xml").exists() or (path / "build.gradle").exists() or (path / "build.gradle.kts").exists():
        return _analyze_java(path)
        
    # Heurística Ruby
    if (path / "Gemfile").exists() or list(path.glob("*.rb")):
        return _analyze_ruby(path)
        
    return None
