import os
from pathlib import Path
from ezops.analyzer.models import StackInfo

def generate_terraform(directory_path: str, stack_info: StackInfo, provider: str = "aws"):
    """
    Gera um arquivo main.tf padrão com o Provider escolhido.
    Suporta aws, gcp, e azure.
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

    tf_content = ""
    
    user_data_script = f"""#!/bin/bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \\$(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
"""

    if provider == "aws":
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
{user_data_script}
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

    elif provider == "gcp":
        tf_content = f"""terraform {{
  required_providers {{
    google = {{
      source  = "hashicorp/google"
      version = "~> 4.0"
    }}
  }}
}}

provider "google" {{
  project = "my-gcp-project-id"
  region  = "us-central1"
  zone    = "us-central1-a"
}}

resource "google_compute_firewall" "ezops_firewall" {{
  name    = "ezops-{stack_info.name}-firewall"
  network = "default"

  allow {{
    protocol = "tcp"
    ports    = ["22", "80", "{app_port}"]
  }}

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ezops-app"]
}}

resource "google_compute_instance" "ezops_server" {{
  name         = "ezops-{stack_info.name}-server"
  machine_type = "e2-micro"
  
  boot_disk {{
    initialize_params {{
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }}
  }}

  network_interface {{
    network = "default"
    access_config {{
      # Ephemeral public IP
    }}
  }}

  metadata_startup_script = <<-EOF
{user_data_script}
EOF

  tags = ["ezops-app"]
}}

output "public_ip" {{
  value       = google_compute_instance.ezops_server.network_interface.0.access_config.0.nat_ip
  description = "Public IP of the Compute Engine instance"
}}
"""

    elif provider == "azure":
        tf_content = f"""terraform {{
  required_providers {{
    azurerm = {{
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }}
  }}
}}

provider "azurerm" {{
  features {{}}
}}

resource "azurerm_resource_group" "ezops_rg" {{
  name     = "ezops-{stack_info.name}-resources"
  location = "East US"
}}

resource "azurerm_public_ip" "ezops_ip" {{
  name                = "ezops-public-ip"
  resource_group_name = azurerm_resource_group.ezops_rg.name
  location            = azurerm_resource_group.ezops_rg.location
  allocation_method   = "Dynamic"
}}

resource "azurerm_virtual_network" "ezops_vnet" {{
  name                = "ezops-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.ezops_rg.location
  resource_group_name = azurerm_resource_group.ezops_rg.name
}}

resource "azurerm_subnet" "ezops_subnet" {{
  name                 = "internal"
  resource_group_name  = azurerm_resource_group.ezops_rg.name
  virtual_network_name = azurerm_virtual_network.ezops_vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}}

resource "azurerm_network_interface" "ezops_nic" {{
  name                = "ezops-nic"
  location            = azurerm_resource_group.ezops_rg.location
  resource_group_name = azurerm_resource_group.ezops_rg.name

  ip_configuration {{
    name                          = "internal"
    subnet_id                     = azurerm_subnet.ezops_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.ezops_ip.id
  }}
}}

resource "azurerm_network_security_group" "ezops_nsg" {{
  name                = "ezops-nsg"
  location            = azurerm_resource_group.ezops_rg.location
  resource_group_name = azurerm_resource_group.ezops_rg.name

  security_rule {{
    name                       = "Allow-AppAndSSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["22", "80", "{app_port}"]
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }}
}}

resource "azurerm_network_interface_security_group_association" "ezops_nsg_assoc" {{
  network_interface_id      = azurerm_network_interface.ezops_nic.id
  network_security_group_id = azurerm_network_security_group.ezops_nsg.id
}}

resource "azurerm_linux_virtual_machine" "ezops_vm" {{
  name                = "ezops-{stack_info.name}-vm"
  resource_group_name = azurerm_resource_group.ezops_rg.name
  location            = azurerm_resource_group.ezops_rg.location
  size                = "Standard_B1s"
  admin_username      = "ubuntu"
  network_interface_ids = [
    azurerm_network_interface.ezops_nic.id,
  ]

  admin_ssh_key {{
    username   = "ubuntu"
    public_key = file("~/.ssh/id_rsa.pub") # Requires local key
  }}

  os_disk {{
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }}

  source_image_reference {{
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }}

  custom_data = filebase64(var.custom_data_script_path)
}}
"""
        # Hack to inject custom data directly in Terraform requires base64, so we write the script locally
        script_path = path / "setup.sh"
        script_path.write_text(user_data_script)
        
        # Modify the tf_content to use the local script we just created for custom_data
        tf_content = tf_content.replace(
            'filebase64(var.custom_data_script_path)',
            f'filebase64("${{path.module}}/setup.sh")'
        )

    else:
        raise ValueError(f"Provider suportado incorreto: {{provider}}. Escolha aws, gcp ou azure.")

    main_tf.write_text(tf_content)
    return True
