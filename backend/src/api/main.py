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
