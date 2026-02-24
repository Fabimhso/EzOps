terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = "my-gcp-project-id"
  region  = "us-central1"
  zone    = "us-central1-a"
}

resource "google_compute_firewall" "ezops_firewall" {
  name    = "ezops-python-firewall"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ezops-app"]
}

resource "google_compute_instance" "ezops_server" {
  name         = "ezops-python-server"
  machine_type = "e2-micro"
  
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {
      # Ephemeral public IP
    }
  }

  metadata_startup_script = <<-EOF
#!/bin/bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

EOF

  tags = ["ezops-app"]
}

output "public_ip" {
  value       = google_compute_instance.ezops_server.network_interface.0.access_config.0.nat_ip
  description = "Public IP of the Compute Engine instance"
}
