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

    def start_container(self, container_id: str) -> bool:
        try:
            container = self.client.containers.get(container_id)
            container.start()
            return True
        except Exception as e:
            logger.error(f"Error starting container {container_id}: {e}")
            return False

    def stop_container(self, container_id: str) -> bool:
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            return True
        except Exception as e:
            logger.error(f"Error stopping container {container_id}: {e}")
            return False

    def restart_container(self, container_id: str) -> bool:
        try:
            container = self.client.containers.get(container_id)
            container.restart()
            return True
        except Exception as e:
            logger.error(f"Error restarting container {container_id}: {e}")
            return False

    def get_container_stats(self, container_id: str) -> dict:
        try:
            container = self.client.containers.get(container_id)
            if container.status != 'running':
                return {"cpu": "-", "mem": "-"}
            
            stats = container.stats(stream=False)
            
            # CPU Calc
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_cpu_delta = stats['cpu_stats']['system_cpu_usage'] - stats.get('precpu_stats', {}).get('system_cpu_usage', 0)
            
            # Number of CPUs
            number_cpus = stats['cpu_stats'].get('online_cpus', 1)
            
            cpu_percent = 0.0
            if system_cpu_delta > 0.0 and cpu_delta > 0.0:
                cpu_percent = (cpu_delta / system_cpu_delta) * number_cpus * 100.0

            # Mem Calc
            mem_usage = stats['memory_stats'].get('usage', 0)
            # Remove cache from memory usage if available
            if 'stats' in stats['memory_stats'] and 'cache' in stats['memory_stats']['stats']:
                mem_usage -= stats['memory_stats']['stats']['cache']
                
            mem_mb = mem_usage / (1024 * 1024)
            
            return {
                "cpu": f"{cpu_percent:.2f}%",
                "mem": f"{mem_mb:.1f}MB"
            }
        except Exception as e:
            logger.error(f"Error getting stats for container {container_id}: {e}")
            return {"cpu": "-", "mem": "-"}
