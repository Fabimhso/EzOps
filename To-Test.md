# 🧪 EzOps - Guia de Testes e CLI

Este documento contém o histórico exato dos comandos executados para validar a arquitetura "Live Interactivity" (Container Actions, Secrets Proxy e Logs Streaming) diretamente na API do FastAPI, bem como um guia detalhado sobre a **Interface de Linha de Comando (CLI)** que desenvolvemos.

---

## 💻 EzOps CLI - Comandos e Funcionalidades

O EzOps fornece uma CLI inteligente (`ezops`) construída em Python (Typer + Rich) projetada para detectar contextos de projeto, diagnosticar linguagens e automatizar 100% da infraestrutura em nuvem e conteinerização em segundos. 

Para habilitar a CLI na máquina (uma vez na pasta root):
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

Abaixo os comandos principais da nossa ferramenta:

### 1. `ezops init .` (Smart Containerizer)
**O que faz:** Ao rodar este comando na raiz de um projeto, a CLI faz um tracking heurístico (lê `package.json`, `requirements.txt`, `go.mod`, etc.) e descobre a linguagem e o framework do projeto. 
**Pra que é útil:** Ele **cria instantaneamente** arquivos `Dockerfile` seguros (usando multi-stage build e non-root users para segurança) e um `docker-compose.yml` base, tirando do desenvolvedor o fardo de decorar sintaxes de Docker. Permite que o projeto suba e fique disponível em segundos na máquina ou dashboard local.

### 2. `ezops iac .` (Infra-as-Code AWS Generator)
**O que faz:** Gera um arquivo `main.tf` configurado com Instância EC2 (Amazon Linux/Ubuntu) contendo um script de Boot automático (User Data) que vai pré-instalar `Docker` e o `Docker Compose` na EC2 de hospedagem. Adicionalmente, mapeia e injeta os Security Groups da porta exposta detectada pela heurística no step anterior (ex: se é React/Node, abre a porta 3000; se é FastAPI, abre a 8000).
**Pra que é útil:** Prepara um script robusto terraform provisionando computação na nuvem já com firewall liberado para os containers funcionarem perfeitamente no IP Público em Produção.

### 3. `ezops iac . --provider gcp` (GCP Engine)
**O que faz:** Utiliza o gerador multi-cloud para gerar código Terraform equivalente ao anterior, mas arquitetado para **Google Cloud Platform**. Ele provisiona instâncias no Compute Engine (`google_compute_instance`) e também abre portas usando as regras do `google_compute_firewall`.
**Pra que é útil:** Flexibilidade total de cloud. O dev não fica preso à AWS; com um parametro `--provider`, a infra segue as diretivas da API do Google, mantendo o projeto "Cloud-Agnostic".

### 4. `ezops iac . --provider azure` (Azure Virtual Machines)
**O que faz:** Produz o `main.tf` estruturado com o bloco da **Azure RM** (`azurerm_linux_virtual_machine`). Configura Redes Virtuais, Subnets, e Associações de Network Security Group (NSG) compatíveis com o ecossistema da Microsoft.
**Pra que é útil:** Atinge times Enterprise que já investem no ambiente Azure, oferecendo integração Docker de um-clique com recursos atrelados a um Resource Group central, pronto para operar cargas via contêineres e SSH.

---

## 🔬 Testes da API (Mock e Interatividade em Tempo Real)

Você pode reproduzir esses testes no seu terminal para verificar o ecossistema funcionando "por baixo dos panos" da Dashboard React conectando ao FastAPI backend.

### 1. Subindo um Container de Teste (Mock)
Iniciamos um container Nginx simples, rodando em background (`-d`), para o EzOps gerenciar:
```bash
docker run -d --name ezops-test-nginx -p 8081:80 nginx:alpine
```

### 2. Testando a Rota Global de Containers
Verificamos se o Backend do EzOps estava capturando os metadados deste novo container ativo (substituindo o antigo mock do Frontend):
```bash
curl -s http://localhost:8080/api/containers
```
*(Espera-se receber um JSON detalhando os containers e as instâncias ligadas)*

### 3. Inspecionando o Uso de CPU/RAM em Tempo Real
Pegamos o ID do Nginx retornado no passo anterior e pedimos o recálculo de recursos consumidos pelo backend (que processa pacotes do dockerd `stats` de forma eficiente na API):
```bash
# Substitua <CONTAINER_ID> pelo ID retornado na listagem
curl -s http://localhost:8080/api/containers/<CONTAINER_ID>/stats
```
*(Espera-se receber um JSON no formato `{"cpu":"0.00%","mem":"7.5MB"}`)*

### 4. Interceptando o Fluxo de Logs (Server-Sent Events)
Testamos o pipe (stream) simultâneo de Logs. 
Fizemos um `curl` na porta `:8081` (Nginx) para gerar tráfego de acesso real dentro do container. Imediatamente depois, interceptamos o Log da saída padrão (`/api/containers/{id}/logs`) durante 3 segundos:
```bash
curl -s http://localhost:8081 > /dev/null && timeout 3 curl -s -N http://localhost:8080/api/containers/<CONTAINER_ID>/logs
```
*(A saída retornará as linhas prefixadas por `data: `, provando a conexão permanente EventSource)*

### 5. Executando Ações Hostis (Stop) e Conferindo Quebra
Para testar a rota transacional, disparamos um POST de **Stop**, esperamos 2 segundos, e pedimos novamente as métricas, provando que a API intervem sob demanda:
```bash
curl -X POST -s http://localhost:8080/api/containers/<CONTAINER_ID>/stop && \
sleep 2 && \
curl -s http://localhost:8080/api/containers/<CONTAINER_ID>/stats
```
*(O retorno final deverá certificar o status dormente: `{"cpu":"-","mem":"-"}`)*

### 6. Validação de Segurança do Cofre (Secrets API)
Pedimos ao Injector a configuração de banco de dados (`DATABASE_URL`). O backend intercepta o pedido remoto pro Boto3 e alerta erros controlados em vez de derrubar a plataforma se a Cloud não estiver com o arquivo em `~/.aws/credentials`:
```bash
curl -s http://localhost:8080/api/secrets/DATABASE_URL
```
*(Retorno validado: `{"error":"Secret não encontrado ou AWS não configurada."}`)*
