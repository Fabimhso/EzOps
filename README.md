# 🚀 EzOps — Simplified Deployment & Orchestration Platform

**EzOps** is an innovative platform consisting of a smart **CLI** and **Web Dashboard**, designed to revolutionize and simplify the lives of DevOps and MLOps engineers. The tool unifies and automates the most repetitive day-to-day tasks, with a strong focus on **security** and **containerization**.

---

## 🎯 The Problem We Solve

The DevOps/MLOps routine often involves hours spent on manual and repetitive tasks:

* Writing `Dockerfile` and `docker-compose.yml` from scratch for every new microservice.
* Manually configuring and maintaining CI/CD pipelines.
* Managing secrets and environment variables insecurely (such as exposed or decentralized `.env` files).
* Monitoring the health and logs of multiple environments without centralized visibility.
* Performing production rollbacks with fear and uncertainty.

**EzOps** acts as the automation layer that eliminates these headaches.

---

## ✨ Core Features

* 🤖 **Smart Containerizer:** Analyzes your project and automatically generates `Dockerfile` and `docker-compose.yml` files following optimization and security best practices.

  * **Currently Supported Languages:**

    * Node.js (Next.js, Express, NestJS)
    * Python (FastAPI, Django, Flask)
    * Go (Golang 1.20+)
    * Java (Maven or Gradle, supports Spring Boot)
    * Ruby (Rails or Sinatra)

* 🔐 **Secure Secrets Manager:** Integrated security vault that allows storing and injecting secrets directly into containers at runtime, ensuring sensitive credentials are never stored in plain text.

* 🚀 **Deploy Pipeline Wizard:** Assistant for automatically creating CI/CD pipelines (GitHub Actions / GitLab CI) with built-in best practices for security, linting, and testing.

* 📊 **Centralized Health Dashboard:** Intuitive web panel to monitor containers, inspect logs, and track real-time metrics.

* ⏪ **Instant Rollback (1-Click):** Deployment version control that allows reverting any system to a previous stable version with a single click.

* 🧠 **Simple ML Model Serving:** Makes packaging and deploying Machine Learning models (via FastAPI + Docker) painless, without dependency struggles.

---

## 🏗️ Technology Stack

The EzOps ecosystem is designed using modern and high-performance tools:

* **CLI:** Python (Typer/Click)
* **Backend / API:** Python (FastAPI)
* **Frontend (Dashboard):** Next.js
* **Core Infrastructure:** Docker, Docker Compose
* **Security (Secrets):** Advanced encryption (AES-256) / HashiCorp Vault
* **Database:** PostgreSQL (relational data) + Redis (cache and messaging)
* **CI/CD:** Seamless integration with GitHub Actions

---

## 🔐 Security Commitment (DevSecOps)

Security is not secondary in EzOps — it is the foundation:

* No secrets stored in plain text.
* Built-in vulnerability scanning (e.g., via Trivy) for generated Docker images.
* Best practices applied for permissions and containers running in *rootless* mode.

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

## 🌐 Running the EzOps Dashboard (UI)

For a visual experience, jump into the dashboard directory and run our React Next.js interface:

```bash
cd dashboard
npm install
npm run dev
```
Access `http://localhost:3000` to interact with our mock containers and secrets manager securely.