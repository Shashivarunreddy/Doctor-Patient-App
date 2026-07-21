# Fetch latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# SSH Key Pair
resource "aws_key_pair" "this" {
  count      = var.ssh_public_key != "" ? 1 : 0
  key_name   = "docco-${var.environment}-key"
  public_key = var.ssh_public_key

  tags = {
    Name        = "docco-${var.environment}-key"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Bastion Host (Public Subnet)
resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.micro"
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.bastion_sg_id]
  key_name                    = var.ssh_public_key != "" ? aws_key_pair.this[0].key_name : null
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name        = "docco-${var.environment}-bastion-host"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Backend EC2 Instance (Private Subnet)
resource "aws_instance" "backend" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = var.private_subnet_id
  vpc_security_group_ids = [var.backend_sg_id]
  key_name               = var.ssh_public_key != "" ? aws_key_pair.this[0].key_name : null

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y ca-certificates curl gnupg lsb-release
              sudo mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              sudo apt-get update -y
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
              sudo usermod -aG docker ubuntu
              sudo mkdir -p /mnt/monitoring
              EOF

  tags = {
    Name        = "docco-${var.environment}-backend-instance"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# AWS EBS Volume for Prometheus TSDB & Grafana persistent state
resource "aws_ebs_volume" "monitoring_data" {
  availability_zone = aws_instance.backend.availability_zone
  size              = var.ebs_volume_size
  type              = "gp3"
  encrypted         = true

  tags = {
    Name        = "docco-${var.environment}-monitoring-ebs"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Attach EBS volume to backend EC2 instance
resource "aws_volume_attachment" "monitoring_att" {
  device_name = "/dev/xvdf"
  volume_id   = aws_ebs_volume.monitoring_data.id
  instance_id = aws_instance.backend.id
}
