import os
from pathlib import Path
from ezops.analyzer.models import StackInfo

def generate_terraform(directory_path: str, stack_info: StackInfo):
    """
    Gera um arquivo main.tf padrão com AWS Provider, 
    Security Group e uma instância EC2 que inicializa com Docker instalado
    via remote user_data script.
    """
    path = Path(directory_path)
    main_tf = path / "main.tf"
    
    # Port mapping logic helper
    app_port = 80
    if stack_info.name == "node":
        app_port = 3000
    elif stack_info.name == "python":
        app_port = 8000
    elif stack_info.name == "go":
        app_port = 8080
    elif stack_info.name == "java":
        app_port = 8080
    elif stack_info.name == "ruby":
        app_port = 3000

    tf_content = f"""terraform {{
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = "us-east-1"
}}

resource "aws_security_group" "ezops_sg" {{
  name        = "ezops_{stack_info.name}_sg"
  description = "Allow HTTP, SSH and App traffic"

  ingress {{
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  ingress {{
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  # Specific port for {stack_info.name} app
  ingress {{
    from_port   = {app_port}
    to_port     = {app_port}
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }}

  egress {{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }}
}}

resource "aws_instance" "ezops_server" {{
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS us-east-1
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.ezops_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
              sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $$(lsb_release -cs) stable"
              sudo apt-get update
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
              sudo systemctl enable docker
              sudo systemctl start docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {{
    Name = "EzOps_{stack_info.name.capitalize()}_Server"
    ManagedBy = "EzOps"
  }}
}}

output "public_ip" {{
  value       = aws_instance.ezops_server.public_ip
  description = "Public IP of the EC2 instance"
}}
"""
    main_tf.write_text(tf_content)
    return True
