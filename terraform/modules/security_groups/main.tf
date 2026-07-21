# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "docco-${var.environment}-alb-sg"
  description = "Allows public inbound HTTP/HTTPS traffic to the ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP Inbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Inbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Outbound to Backend EC2 container port 5000"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["10.1.0.0/16"]
  }

  tags = {
    Name        = "docco-${var.environment}-alb-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Bastion Host Security Group
resource "aws_security_group" "bastion" {
  name        = "docco-${var.environment}-bastion-sg"
  description = "Restricted SSH access from admin IP"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from developer IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }

  egress {
    description = "SSH to private VPC subnets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.1.0.0/16"]
  }

  tags = {
    Name        = "docco-${var.environment}-bastion-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# EC2 Backend Security Group
resource "aws_security_group" "backend" {
  name        = "docco-${var.environment}-backend-sg"
  description = "Security group for backend EC2 instances in private subnets"
  vpc_id      = var.vpc_id

  ingress {
    description     = "HTTP traffic from ALB only"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "SSH from Bastion Host only"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  ingress {
    description     = "Prometheus metrics from Bastion/Internal"
    from_port       = 9090
    to_port         = 9090
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  ingress {
    description     = "Grafana dashboards from Bastion/Internal"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "Outbound for external package downloads & Docker Hub pulls via NAT"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "docco-${var.environment}-backend-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Database Security Group (PostgreSQL)
resource "aws_security_group" "db" {
  name        = "docco-${var.environment}-db-sg"
  description = "Restricts PostgreSQL port 5432 strictly to backend EC2 instances"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL port from Backend SG only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  egress {
    description = "No outbound requests initiated by database"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.1.0.0/16"]
  }

  tags = {
    Name        = "docco-${var.environment}-db-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
