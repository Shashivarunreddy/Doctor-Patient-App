output "vpc_id" {
  description = "The ID of the V2 VPC"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the V2 Application Load Balancer"
  value       = module.alb_acm.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "Domain name of the V2 CloudFront CDN"
  value       = module.s3_cloudfront.cloudfront_domain_name
}

output "s3_frontend_bucket" {
  description = "S3 frontend static asset bucket name"
  value       = module.s3_cloudfront.bucket_name
}

output "rds_endpoint" {
  description = "Endpoint address for PostgreSQL RDS"
  value       = module.rds.endpoint
}

output "bastion_public_ip" {
  description = "Public IP address of the SSH Bastion host"
  value       = module.ec2.bastion_public_ip
}

output "backend_private_ip" {
  description = "Private IP address of the Backend EC2 instance"
  value       = module.ec2.backend_private_ip
}

output "github_actions_access_key_id" {
  description = "AWS Access Key ID for GitHub Actions deployment secret"
  value       = module.iam.access_key_id
}

output "github_actions_secret_access_key" {
  description = "AWS Secret Access Key for GitHub Actions deployment secret"
  value       = module.iam.secret_access_key
  sensitive   = true
}
