output "bucket_name" {
  description = "Name of S3 frontend asset bucket"
  value       = aws_s3_bucket.frontend.id
}

output "bucket_arn" {
  description = "ARN of S3 frontend asset bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of CloudFront CDN distribution"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of CloudFront distribution for cache invalidation"
  value       = aws_cloudfront_distribution.cdn.id
}
