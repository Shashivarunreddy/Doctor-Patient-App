variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of frontend S3 bucket for policy scope"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN of CloudFront distribution for invalidation scope"
  type        = string
}
