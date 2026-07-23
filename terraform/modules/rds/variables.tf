variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "db_subnet_group_name" {
  description = "Name of the DB Subnet Group"
  type        = string
}

variable "db_sg_id" {
  description = "Security group ID for RDS database"
  type        = string
}

variable "db_name" {
  description = "Name of initial database"
  type        = string
  default     = "docco360"
}

variable "db_user" {
  description = "Master username for database"
  type        = string
  default     = "docco_db_user"
}

variable "db_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
}

variable "instance_class" {
  description = "DB instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage size (GB)"
  type        = number
  default     = 20
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}
