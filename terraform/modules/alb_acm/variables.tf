variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB placement"
  type        = list(string)
}

variable "alb_sg_id" {
  description = "Security Group ID for ALB"
  type        = string
}

variable "backend_instance_id" {
  description = "Backend EC2 instance ID to attach to target group"
  type        = string
}

variable "domain_name" {
  description = "Domain name for ACM certificate and Route 53 (e.g. docco.arakutravels.com)"
  type        = string
  default     = ""
}

variable "enable_ssl" {
  description = "Enable ACM certificate and HTTPS 443 listener"
  type        = bool
  default     = false
}
