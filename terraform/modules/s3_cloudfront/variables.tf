variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "bucket_name_prefix" {
  description = "Prefix for S3 static frontend asset bucket"
  type        = string
  default     = "docco360-frontend"
}
