from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .docker_service import DockerService

app = FastAPI(title="EzOps Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

docker_client = DockerService()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "docker_connected": docker_client.client is not None}

@app.get("/api/containers")
def list_containers():
    """Retorna os containeres no formato da Dashboard"""
    containers = docker_client.get_containers()
    
    # Calculate some generic metrics 
    active = sum(1 for c in containers if c['status'] == 'Running')
    
    return {
        "metrics": {
            "active_containers": active,
            "total_containers": len(containers)
        },
        "containers": containers
    }
