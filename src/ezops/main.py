import typer
from rich.console import Console
from ezops.analyzer import engine as analyzer_engine
from ezops.generator import engine as generator_engine

app = typer.Typer(help="EzOps CLI - Smart Containerizer and DevOps toolbox", no_args_is_help=True)
console = Console()

@app.callback()
def callback():
    """EzOps CLI"""
    pass

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
    
@app.command()
def iac(
    path: str = typer.Argument(
        ".", help="O diretório do projeto para analisar e gerar a infraestrutura (Terraform)"
    ),
    provider: str = typer.Option(
        "aws", help="Provedor de nuvem destino para a infraestrutura (aws, gcp, azure)"
    )
):
    """
    Analisa o diretório e gera arquivos Terraform (main.tf) para provisionar 
    a infraestrutura necessária na Nuvem (Ex: AWS EC2).
    """
    console.print(f"[bold blue]🚀 Iniciando EzOps IaC Generator no diretório:[/bold blue] {path}")
    console.print(f"[bold blue]☁️  Provedor selecionado:[/bold blue] {provider.upper()}")
    
    stack_info = analyzer_engine.analyze_directory(path)
    
    if not stack_info:
        console.print("[bold red]❌ Não foi possível detectar a stack do projeto para IaC.[/bold red]")
        raise typer.Exit(code=1)
        
    console.print(f"[bold green]✅ Stack detectada para IaC:[/bold green] {stack_info.name} (v{stack_info.version})")
    
    from ezops.generator import iac_generator
    try:
        iac_generator.generate_terraform(path, stack_info, provider.lower())
    except ValueError as e:
        console.print(f"[bold red]❌ Erro:[/bold red] {e}")
        raise typer.Exit(code=1)
    
    console.print("[bold green]✨ Arquivo main.tf gerado com sucesso![/bold green]")
    console.print("Recomendado: rode [bold yellow]terraform init && terraform apply[/bold yellow]")

if __name__ == "__main__":
    app()
