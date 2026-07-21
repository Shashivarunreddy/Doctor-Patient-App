variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for Bastion Host"
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet ID for Backend EC2 instance"
  type        = string
}

variable "bastion_sg_id" {
  description = "Security group ID for Bastion Host"
  type        = string
}

variable "backend_sg_id" {
  description = "Security group ID for Backend EC2"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for Backend node"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key" {
  description = "SSH public key string for EC2 access"
  type        = string
  default     = ""
}

variable "ebs_volume_size" {
  description = "Size of monitoring persistent EBS volume (GB)"
  type        = number
  default     = 32
}
