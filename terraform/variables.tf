variable "aws_region" {
  description = "Target AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. v2-dev, v2-prod)"
  type        = string
  default     = "v2"
}

variable "vpc_cidr" {
  description = "CIDR block for the V2 VPC"
  type        = string
  default     = "10.1.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.1.1.0/24", "10.1.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "Private App subnet CIDRs"
  type        = list(string)
  default     = ["10.1.3.0/24", "10.1.4.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "Private DB subnet CIDRs"
  type        = list(string)
  default     = ["10.1.5.0/24", "10.1.6.0/24"]
}

variable "admin_ip" {
  description = "Developer IP for SSH Bastion access"
  type        = string
  default     = "0.0.0.0/0"
}

variable "instance_type" {
  description = "Backend EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "ssh_public_key" {
  description = "SSH public key string for EC2 instances"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "Name of initial PostgreSQL database"
  type        = string
  default     = "docco360"
}

variable "db_user" {
  description = "Master username for PostgreSQL database"
  type        = string
  default     = "docco_db_user"
}

variable "db_password" {
  description = "Master password for PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Target domain name for SSL and load balancer (e.g. docco.arakutravels.com)"
  type        = string
  default     = ""
}

variable "enable_ssl" {
  description = "Enable HTTPS 443 and ACM certificate"
  type        = bool
  default     = false
}
