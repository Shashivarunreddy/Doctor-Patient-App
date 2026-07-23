variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "admin_ip" {
  description = "Developer CIDR block permitted for SSH access (e.g. 203.0.113.5/32)"
  type        = string
  default     = "0.0.0.0/0"
}
