import typer
from rich.console import Console
from ezops.analyzer import engine as analyzer_engine
from ezops.generator import engine as generator_engine

app = typer.Typer(help="EzOps CLI - Smart Containerizer and DevOps toolbox")
console = Console()

@app.command()
def init(
    path: str = typer.Argument(
        ".", help="O diretório do projeto para analisar e containerizar"
    )
):
    """
    Analisa o diretório informado e gera automaticamente 
    um Dockerfile e um docker-compose.yml baseados na stack do projeto.
    """
    console.print(f"[bold blue]🚀 Iniciando EzOps no diretório:[/bold blue] {path}")
    
    # 1. Analisa os arquivos do projeto para descobrir a stack
    stack_info = analyzer_engine.analyze_directory(path)
    
    if not stack_info:
        console.print("[bold red]❌ Não foi possível detectar a stack do projeto.[/bold red]")
        raise typer.Exit(code=1)
        
    console.print(f"[bold green]✅ Stack detectada:[/bold green] {stack_info.name} (v{stack_info.version})")
    
    # 2. Gera os arquivos baseados na stack detectada
    generator_engine.generate_files(path, stack_info)
    
    console.print("[bold green]✨ Containerização concluída com sucesso![/bold green]")
    console.print("Recomendado: rode [bold yellow]docker compose up --build[/bold yellow]")

if __name__ == "__main__":
    app()
