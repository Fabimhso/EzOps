# 🚀 EzOps — Plataforma de Deploy e Orquestração Simplificada

O **EzOps** é uma plataforma inovadora que consiste em uma **CLI** e um **Dashboard Web** inteligentes, com o objetivo de revolucionar e facilitar a vida de engenheiros DevOps e MLOps. A ferramenta unifica e automatiza as tarefas mais repetitivas do dia a dia, mantendo um forte foco em **segurança** e **conteinerização**.

## 🎯 O Problema que Resolvemos

A rotina de DevOps/MLOps frequentemente envolve horas gastas em tarefas manuais e repetitivas:
- Escrever `Dockerfile` e `docker-compose.yml` do zero para cada novo microsserviço.
- Configurar e manter pipelines de CI/CD manualmente.
- Gerenciar _secrets_ e variáveis de ambiente de forma insegura (como `.env` expostos ou não centralizados).
- Monitorar a saúde e os logs de múltiplos ambientes sem visibilidade centralizada.
- Fazer rollbacks de serviços em produção com medo e incerteza.

O **EzOps** entra como a camada de automação que elimina essas dores de cabeça.

## ✨ Funcionalidades Principais (Core Features)

- 🤖 **Smart Containerizer:** Analisa o projeto e gera automaticamente o `Dockerfile` e o `docker-compose.yml` com as melhores práticas de otimização e segurança.
  - **Linguagens Suportadas atualmente:**
    - Node.js (Next.js, Express, NestJS)
    - Python (FastAPI, Django, Flask)
    - Go (Golang 1.20+)
    - Java (Maven ou Gradle, suporta Spring Boot)
    - Ruby (Rails ou Sinatra)
- 🔐 **Secrets Manager Seguro:** Cofre de segurança (Vault) integrado que permite armazenar e injetar secrets diretamente nos containers em tempo de execução, garantindo que credenciais sensíveis nunca fiquem em texto plano.
- 🚀 **Deploy Pipeline Wizard:** Assistente para criação automática de pipelines CI/CD (GitHub Actions / GitLab CI) já com boas práticas de segurança, lint e testes embutidos.
- 📊 **Health Dashboard Centralizado:** Painel web intuitivo para monitorar containers, verificar logs e acompanhar métricas em tempo real.
- ⏪ **Rollback Instantâneo (1-Click):** Controle de versão de deployments que permite reverter qualquer sistema para uma versão anterior segura com um único clique.
- 🧠 **ML Model Serving Simples:** Facilita o empacotamento e deploy de modelos de Machine Learning (via FastAPI + Docker) sem sofrimento com dependências.

## 🏗️ Stack Tecnológica

O ecossistema do EzOps é projetado para ser construído utilizando ferramentas modernas e performáticas:

- **CLI:** Python (Typer/Click)
- **Backend / API:** Python (FastAPI)
- **Frontend (Dashboard):** Next.js 
- **Infraestrutura Core:** Docker, Docker Compose
- **Segurança (Secrets):** Criptografia avançada (AES-256) / HashiCorp Vault
- **Banco de Dados:** PostgreSQL (dados relacionais) + Redis (cache e mensageria)
- **CI/CD:** Integração transparente com GitHub Actions

## 🔐 Compromisso com a Segurança (DevSecOps)

A segurança não é segundo plano no EzOps, é o alicerce:
- Nenhuma _secret_ armazenada em texto plano.
- Scans de vulnerabilidade embutidos (ex: via Trivy) para as imagens Docker geradas.
- Aplicação das melhores práticas em permissões e containers rodando em modo *rootless*.
## 🚀 Como Rodar o EzOps Localmente (CLI)

O EzOps está em desenvolvimento ativo. Para rodar a primeira versão da nossa CLI (Smart Containerizer), clone o repositório e rode os comandos abaixo usando **Python 3.9+**:

```bash
# 1. Crie e ative um ambiente virtual
python3 -m venv .venv
source .venv/bin/activate

# 2. Instalar o projeto em modo de desenvolvimento
pip install -e .

# 3. Rodar o comando de init na pasta do seu projeto 
ezops init .
```

A CLI analisará automaticamente o seu projeto e criará um `Dockerfile` otimizado e um `docker-compose.yml` base para a sua tecnologia.



🛠️ CLI First — Começar pela CLI (mais rápido de implementar, valor imediato)
🌐 Dashboard First — Começar pelo painel web (mais visual e impressionante)
🔐 Secrets Manager — Começar pelo gerenciador de secrets (maior impacto em segurança)
🤖 Smart Containerizer — Começar pelo gerador automático de Dockerfiles (muito útil no dia a dia)
