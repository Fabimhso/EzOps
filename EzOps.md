# 🎉 EzOps: Smart Containerizer Concluído (MVP 1)

Finalizamos a primeira e principal entrega do projeto EzOps: a **CLI Intelegente**.

## O que foi construído (MVP 1.0 e 1.5)

1. **Framework e Estrutura base:** Criamos o projeto Python usando o moderno gerenciador de pacotes `hatchling` (através do `pyproject.toml`) e implementamos a interface de linha de comando usando o framework Pydantic-based **Typer** junto ao **Rich** (para outputs coloridos no terminal).
2. **Motor Analisador (Heurística):** Desenvolvemos o módulo que é capaz de ler o diretório atual do usuário em busca de arquivos-chave como `package.json`, `requirements.txt`, `go.mod`, `pom.xml`, ou `Gemfile`.
    - Atualmente Suportamos nativamente: **NodeJS (Next/Express/NestJS) | Python (FastAPI/Django/Flask) | Go | Java (Maven/Gradle) | Ruby (Rails/Sinatra)**.
3. **Motor Gerador de Templates:** Implementamos lógicas escaláveis para escrita de **Dockerfiles** baseados em multi-stage build, configurados adequadamente para os ambientes detectados (ex: user `appuser`, remoção de builds legados) e gerador de arquivos `docker-compose.yml` contendo mapeamento de portas corretos de cada framework.

## Automação e Testes

Foram desenvolvidos **testes automatizados usando `pytest`** para cobrir as funções da CLI com todos os edge-cases mapeados.

### Rodando o EzOps

```bash
# Se quiser testar na sua máquina agora:
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Dentro de qualquer diretório compatível você pode rodar o comando:
ezops init .
```

### Resultados dos Testes

Rodamos testes que simulam mocks de arquivos e validamos a escrita em disco nativa e interpretador de engine:

```
> pytest tests/
===== test session starts =====
tests/test_analyzer.py .....
tests/test_generator.py .....
===== 11 passed in 0.12s =======
```

## O que foi construído (MVP 2.0 - Web Dashboard)

Decidimos criar uma **Web Dashboard** moderna construída sobre o ecossistema do **Next.js (App Router)** usando TypeScript e **Tailwind CSS**. Neste MVP entregamos os **mockups visuais** de alta fidelidade:

1. **Layout e Navegação:** Topbar e Sidebar responsivas baseadas nos ícones do pacote `lucide-react`.
2. **Overview Board:** Página inicial do Dashboard exibindo *Cards* simulados de métricas de uso de CPU, I/O e uma tabela de status dos serviços ativados.
3. **Secrets Manager Viewer:** Uma interface de Vault focada em segurança, com a capacidade de agrupar secrets via environment (*Production*, *Staging*, etc.), e esconder (masking) o valor da senha por padrão a não ser que clicada no botão Reveal.

### Rodando o EzOps Web Dashboard

```bash
# Na sua máquina, acesse a pasta da dashboard
cd dashboard

# Caso não tenha inicializado ainda, instale os pacotes:
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

E acesse `http://localhost:3000` no seu navegador!

### Rodando o EzOps Web Dashboard (MVP 3)

Com a arquitetura integrada completa, você pode rodar as duas pontas da plataforma para visualizar os servidores Docker e as métricas na Web em tempo real.

**1. Iniciando o Backend FastAPI (Client do Docker):**
Abra um terminal, acesse a pasta `backend` e rode a API localmente:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn src.api.main:app --port 8080 --reload
```
*(Nota: O Backend consome o socket `/var/run/docker.sock`, portanto ele precisa que você possua o serviço Docker ativo e com as permissões corretas).*

**2. Iniciando a Interface Web (Dashboard):**
Em um novo terminal na pasta root, acesse a UI compilada:
```bash
cd dashboard
npm install
npm run dev
```
Com as duas camadas ligadas, acesse `http://localhost:3000` em seu navegador para ver os contêineres e imagens sendo refletidas pela dashboard construída!

---

### Frontend Development
The frontend is built with React 18, Next.js App Router, Tailwind CSS, and Lucide React.
1. `app/layout.tsx`: Configured dark mode enforcing via `dark` class on the HTML tag, and structured the overall page with a custom Sidebar and Topbar.
2. `app/page.tsx`: A dynamic Overview connecting to `http://localhost:8080/api/containers`, fetching the user's running Docker containers and formatting their metrics dynamically. 
3. Layout components: Reusable UI Shell components with active-route highlights for a native application feel.

---

## MVP 3: AWS Cloud Integrations

O MVP 3 trouxe o **Cloud Sync** (integrando o container overview com instâncias EC2 da AWS mapeadas para a UI Next.js), o **Secret Injector** e o **IaC Generator**.

### IaC Generator
O comando `ezops iac . --provider [aws|gcp|azure]` processa a detecção de Stack na raiz do projeto do usuário e automatiza o provisionamento dos recursos que dão host e suportam nossos Dockerfiles auto-gerados previamente. Dependendo do ambiente (AWS, GCP ou Azure), scripts `user_data` de VM são interpolados no `main.tf`.

---

## MVP 4: Live Interactivity & Dashboard Intelligence

A quarta e mais ambiciosa entrega transformou a dashboard de um painel de leitura em uma interface Viva de Automação:
1. **Container Actions (`/containers`)**: Componentes de Card assíncronos que possuem `setInterval` individual de 5 segundos para calcular porcentagens de **CPU e RAM**. Incluí botões de Play, Stop e Restart que se comunicam com os novos endpoints transacionais POST do FastAPI.
2. **Secrets Manager (`/secrets`)**: Mapeado para um cofre virtual. Botão de visualização atua como Proxy acionando via backend e `boto3` o colete em tempo-real do cofre do AWS Secrets Manager. Se erro, previne exposição silenciosa e alerta falta de credenciais na UI.
3. **Live Logs (`/logs`)**: Interface centralizada que consome o endpoint FastAPI `/logs` criado utilizando **Server-Sent Events (StreamingResponse)**. Acompanhar a Standard Output do container docker é imediato e com limitação de buffer em memória (mínimo delay, sem crashes no browser).
4. **Cloud Manager (`/settings`)**: Controle físico e seguro da nuvem de modo desacoplado da plataforma. A API resguarda o par de chaves providenciadas inserindo direto em `~/.aws/credentials`, empoderando ferramentas padrão da AWS em sincronia com todo o app da EzOps.

## Ideias e Rotas Futuras
Mapeamos features agressivas para tornar essa nossa ferramenta a mais poderosa dentre o mundo DevSecOps:
1. **Cloud Deploy & Sync:** A arquitetura se tornará apta a visualizar recursos instanciados na AWS/GCP (além dos containers).
2. **IaC Generator Engine:** Capaz de escrever recursos Terraform `main.tf` baseados nesta Stack.
3. **Dynamic Secret Injetor:** Utilizando o EzOps como Vault *on-the-fly* ao invés de variáveis físicas, impedindo os containers de injetar o `DATABASE_URL` cru no disco.
