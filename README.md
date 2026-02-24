# EzOps — Simplified Deployment & Orchestration Platform

**EzOps** is an innovative platform consisting of a smart **CLI** and **Web Dashboard**, designed to revolutionize and simplify the lives of DevOps and MLOps engineers. The tool unifies and automates the most repetitive day-to-day tasks, with a strong focus on **security** and **containerization**.

---

## The Problem We Solve

The DevOps/MLOps routine often involves hours spent on manual and repetitive tasks:

* Writing `Dockerfile` and `docker-compose.yml` from scratch for every new microservice.
* Manually configuring and maintaining CI/CD pipelines.
* Managing secrets and environment variables insecurely (such as exposed or decentralized `.env` files).
* Monitoring the health and logs of multiple environments without centralized visibility.
* Performing production rollbacks with fear and uncertainty.

**EzOps** acts as the automation layer that eliminates these headaches.

---

## Core Features

 **Smart Containerizer:** Analyzes your project and automatically generates `Dockerfile` and `docker-compose.yml` files following optimization and security best practices.

  * **Currently Supported Languages:**

    * Node.js (Next.js, Express, NestJS)
    * Python (FastAPI, Django, Flask)
    * Go (Golang 1.20+)
    * Java (Maven or Gradle, supports Spring Boot)
    * Ruby (Rails or Sinatra)

   **Secure Secrets Manager:** Integrated security vault that allows storing and injecting secrets directly into containers at runtime, ensuring sensitive credentials are never stored in plain text.

 **Deploy Pipeline Wizard:** Assistant for automatically creating CI/CD pipelines (GitHub Actions / GitLab CI) with built-in best practices for security, linting, and testing.

 **Centralized Health Dashboard:** Intuitive web panel to monitor containers, inspect logs, and track real-time metrics.

 **Instant Rollback (1-Click):** Deployment version control that allows reverting any system to a previous stable version with a single click.

 **Simple ML Model Serving:** Makes packaging and deploying Machine Learning models (via FastAPI + Docker) painless, without dependency struggles.

### 3. Rodando as integrações AWS (MVP 3 Phase 2)
O Backend do EzOps agora possui integração nativa com a AWS via `boto3`.
Ao bater na rota `http://localhost:8080/api/containers`, as instâncias EC2 gerenciadas por você na sua conta serão retornadas junto com seus containers locais na aba **Containers** do Front-End.
Caso as credenciais não estejam configuradas em `~/.aws/credentials`, ele irá silenciar o erro e listar apenas os da máquina.

---

## 🛠 Entendendo o `ezops iac` (Infra-as-Code Multi-Cloud)
Em qualquer repositório, execute:
```bash
source .venv/bin/activate
ezops iac . --provider aws
```
O EzOps irá ler o contexto do projeto da mesma forma que o `ezops init` e criar instantaneamente um `main.tf` customizado da **AWS** (HCL do Terraform) já mapeando portas de segurança e provendo instâncias EC2 focadas em rodar contenedores Docker.

Para gerar a infraestrutura em outros provedores, utilize os comandos:
- `ezops iac . --provider gcp` (Compute Engine + Firewall Rules)
- `ezops iac . --provider azure` (Linux Virtual Machines + Network Security Groups)

---

## Technology Stack

The EzOps ecosystem is designed using modern and high-performance tools:

* **CLI:** Python (Typer/Click)
* **Backend / API:** Python (FastAPI)
* **Frontend (Dashboard):** Next.js
* **Core Infrastructure:** Docker, Docker Compose
* **Security (Secrets):** Advanced encryption (AES-256) / HashiCorp Vault
* **Database:** PostgreSQL (relational data) + Redis (cache and messaging)
* **CI/CD:** Seamless integration with GitHub Actions

---

## Security Commitment (DevSecOps)

Security is not secondary in EzOps — it is the foundation:

* No secrets stored in plain text.
* Built-in vulnerability scanning (e.g., via Trivy) for generated Docker images.
* Best practices applied for permissions and containers running in *rootless* mode.

---

## Running EzOps Locally (CLI)

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

## Running the EzOps Dashboard & Backend (UI)

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
