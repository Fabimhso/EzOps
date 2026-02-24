import boto3
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class AWSService:
    def __init__(self, region: str = "us-east-1"):
        # Initializing boto3 without explicit credentials will make it look
        # for them in ~/.aws/credentials or environment variables.
        # This matches the future goal of configuring it via Settings UI.
        try:
            self.ec2_client = boto3.client('ec2', region_name=region)
            self.secrets_client = boto3.client('secretsmanager', region_name=region)
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {e}")
            self.ec2_client = None
            self.secrets_client = None

    def get_ec2_instances(self) -> List[Dict[str, Any]]:
        if not self.ec2_client:
             return []
        
        try:
            response = self.ec2_client.describe_instances()
            formatted_instances = []
            
            for reservation in response.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    # Find instance name
                    name = "Unknown"
                    for tag in instance.get('Tags', []):
                        if tag['Key'] == 'Name':
                            name = tag['Value']
                            break
                    
                    state = instance.get('State', {}).get('Name', 'unknown')
                    public_ip = instance.get('PublicIpAddress', '-')
                    instance_type = instance.get('InstanceType', '-')
                    
                    formatted_instances.append({
                        "name": name,
                        "id": instance.get('InstanceId'),
                        "image": f"AMI: {instance.get('ImageId')} ({instance_type})",
                        "status": "running" if state == "running" else "exited",
                        "ports": f"IP: {public_ip}",
                        "cpu": "-",
                        "mem": "-",
                        "source": "aws"
                    })
            return formatted_instances
        except Exception as e:
            logger.error(f"Error fetching AWS EC2 instances: {e}")
            return []

    def get_secret(self, secret_name: str) -> str:
        """
        Atua como proxy de Secrets Manager, injetando chaves on-the-fly.
        """
        if not self.secrets_client:
            return None
        
        try:
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            if 'SecretString' in response:
                return response['SecretString']
            return None
        except Exception as e:
            logger.error(f"Error fetching secret {secret_name}: {e}")
            return None
