from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .docker_service import DockerService
from .aws_service import AWSService

app = FastAPI(title="EzOps Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

docker_client = DockerService()
aws_client = AWSService()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "docker_connected": docker_client.client is not None}

@app.get("/api/containers")
def list_containers():
    """Retorna os containeres no formato da Dashboard e combina instâncias da AWS"""
    local_containers = docker_client.get_containers()
    cloud_instances = aws_client.get_ec2_instances()
    
    all_instances = local_containers + cloud_instances
    
    # Calculate some generic metrics 
    active = sum(1 for c in all_instances if c['status'] in ['Running', 'running'])
    
    return {
        "metrics": {
            "active_containers": active,
            "total_containers": len(all_instances)
        },
        "containers": all_instances 
    }

@app.get("/api/secrets/{secret_name}")
def fetch_secret(secret_name: str):
    """Resgata um secret diretamente da AWS em tempo real (Runtime Injector)"""
    secret_value = aws_client.get_secret(secret_name)
    if secret_value is None:
        return {"error": "Secret não encontrado ou AWS não configurada."}
    return {"secret_name": secret_name, "value": secret_value}

@app.post("/api/containers/{container_id}/start")
def start_container(container_id: str):
    success = docker_client.start_container(container_id)
    if success:
        return {"status": "success", "message": f"Container {container_id} started"}
    return {"status": "error", "message": "Failed to start container"}

@app.post("/api/containers/{container_id}/stop")
def stop_container(container_id: str):
    success = docker_client.stop_container(container_id)
    if success:
        return {"status": "success", "message": f"Container {container_id} stopped"}
    return {"status": "error", "message": "Failed to stop container"}

@app.post("/api/containers/{container_id}/restart")
def restart_container(container_id: str):
    success = docker_client.restart_container(container_id)
    if success:
        return {"status": "success", "message": f"Container {container_id} restarted"}
    return {"status": "error", "message": "Failed to restart container"}

@app.get("/api/containers/{container_id}/stats")
def get_container_stats(container_id: str):
    stats = docker_client.get_container_stats(container_id)
    return stats

from fastapi.responses import StreamingResponse

@app.get("/api/containers/{container_id}/logs")
def stream_container_logs(container_id: str):
    """Retorna os logs ao vivo do container usando Server-Sent Events (SSE)"""
    def log_generator():
        try:
            container = docker_client.client.containers.get(container_id)
            # Fetch last 100 lines and stream new ones
            for line in container.logs(stream=True, tail=100, follow=True):
                # SSE Format required: data: <message>\n\n
                decoded_line = line.decode('utf-8', errors='replace').strip()
                yield f"data: {decoded_line}\n\n"
        except Exception as e:
            yield f"data: [EzOps Logger] Erro ao conectar nos logs do container {container_id}: {e}\n\n"

    return StreamingResponse(log_generator(), media_type="text/event-stream")

from pydantic import BaseModel
from pathlib import Path

class AWSCreds(BaseModel):
    access_key: str
    secret_key: str

@app.post("/api/settings/aws")
def save_aws_credentials(creds: AWSCreds):
    """Salva credenciais na máquina local ~/.aws/credentials para o Boto3 e o EzOps utilizarem"""
    try:
        aws_dir = Path.home() / ".aws"
        aws_dir.mkdir(parents=True, exist_ok=True)
        credentials_file = aws_dir / "credentials"
        
        content = f"[default]\naws_access_key_id = {creds.access_key}\naws_secret_access_key = {creds.secret_key}\n"
        credentials_file.write_text(content)
        
        # Reset aws_client so it picks up the new credentials on the next request
        global aws_client
        aws_client = AWSService()
        
        return {"status": "success", "message": "AWS credentials saved globally"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
