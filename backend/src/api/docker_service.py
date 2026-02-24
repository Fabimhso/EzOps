import docker
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class DockerService:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            logger.error(f"Failed to connect to Docker Daemon: {e}")
            self.client = None

    def _format_uptime(self, attrs: dict) -> str:
        status = attrs.get('State', {}).get('Status', '')
        return "Running" if status == "running" else "Stopped"

    def _extract_ports(self, attrs: dict) -> str:
        ports = attrs.get('NetworkSettings', {}).get('Ports', {})
        if not ports:
            return "-"
        
        for k, v in ports.items():
            if v is not None and len(v) > 0:
                h = v[0].get('HostPort')
                if h:
                    return h
        
        return "-"

    def get_containers(self) -> List[Dict[str, Any]]:
        """Fetch and format containers for the dashboard logic"""
        if not self.client:
             return []
             
        containers = self.client.containers.list(all=True)
        formatted_containers = []
        
        for c in containers:
            try:
                short_id = c.short_id
                
                image_tags = c.image.tags
                image_name = image_tags[0] if image_tags else c.image.id[:12]
                
                status_formatted = self._format_uptime(c.attrs)
                port_formatted = self._extract_ports(c.attrs)
                uptime_string = c.attrs.get('State', {}).get('StartedAt', c.status)
                
                formatted_containers.append({
                    "id": short_id,
                    "image": image_name,
                    "status": status_formatted,
                    "uptime": uptime_string,
                    "port": port_formatted,
                    "name": c.name
                })
            except Exception as e:
                logger.error(f"Error parsing container {c.id}: {e}")
                
        return formatted_containers
