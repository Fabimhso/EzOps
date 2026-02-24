## 🗺️ Mapa Completo do Projeto e Arquitetura

O EzOps evoluiu para uma plataforma dividida em 3 componentes principais, trabalhando em harmonia:

```
EzOps/
 ├── src/ezops/            (⚙️ CLI Engine)
 │    ├── analyzer/        - Inspeciona o código fonte (Python, Node, Go, Java, Ruby)
 │    ├── generator/       - Cria Dockerfiles e docker-compose baseados na inspeção
 │    └── main.py          - Entrypoint da CLI usando a biblioteca Typer
 │
 ├── backend/              (🔌 API FastAPI - MVP 3)
 │    ├── src/api/
 │    │    ├── main.py     - Servidor Web na porta 8080 (recebendo conexões do front)
 │    │    └── docker_service.py - Instancia o Docker SDK para buscar Containers reais
 │    └── pyproject.toml   - Dependências: fastapi, uvicorn, docker
 │
 └── dashboard/            (🖥️ Interface Web Next.js - MVP 2)
      ├── src/app/
      │    ├── page.tsx    - Overview Board que consome a API na 8080
      │    ├── secrets/    - Mockup visual do Gerenciador de Segredos
      │    └── layout.tsx  - Root layout contendo Sidebar (lucide-react) e Topbar
      └── package.json     - Dependências: react, next, tailwindcss
```


1. IaC Generator Engine (Terraform)
Onde: No pacote Python src/ezops/ da CLI.
Como: Criaremos um comando ezops iac que analisará o docker-compose.yml local e a Stack, convertendo a infraestrutura para um arquivo básico main.tf da AWS (ex: provisionando EC2 ou ECS configurado).
2. Cloud Sync (AWS boto3)
Onde: No pacote backend/src/api/ (FastAPI).
Como: Adicionaremos uma biblioteca de Cloud (ex: boto3) ao pyproject.toml. O Service conectará na AWS usando as credenciais passadas na página Settings do Front e listará instâncias / containers atrelados à conta, mesclando com os da máquina local na dashboard.
3. Secret Injector (Runtime)
Onde: No pacote backend/src/api/.
Como: O Backend atuará como proxy. Ele bate no AWS Secrets Manager, resgata strings (sem gravá-las no disco) e injeta em tempo de execução via variáveis de ambiente da API na inicialização de um container.




---

## 🚀 Running EzOps Locally (CLI)

EzOps is under active development. To run the first version of our CLI (Smart Containerizer), clone the repository and execute the commands below using **Python 3.9+**:

```bash
# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install the project in development mode
pip install -e .

# 3. Run the init command in your project folder
ezops init .
```

The CLI will automatically analyze your project and generate an optimized `Dockerfile` and a base `docker-compose.yml` tailored to your technology.

---

## 🌐 Running the EzOps Dashboard & Backend (UI)

For a complete visual experience, you need to run both the FastAPI Backend and the Next.js Dashboard.

### 1. Start the FastAPI Backend (Docker Client)
The backend requires access to your local Docker daemon (`/var/run/docker.sock`).
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn src.api.main:app --port 8080 --reload
```

### 2. Start the Next.js Dashboard
In a new terminal window, start the frontend interface:
```bash
cd dashboard
npm install
npm run dev
```

Access `http://localhost:3000` to interact with your live containers and secrets manager securely!
