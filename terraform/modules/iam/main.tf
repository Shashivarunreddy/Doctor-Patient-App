# GitHub Actions IAM User
resource "aws_iam_user" "github_actions" {
  name = "docco-${var.environment}-github-actions"

  tags = {
    Name        = "docco-${var.environment}-github-actions"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Restricted Policy for Frontend Deployment (S3 Sync & CloudFront Invalidation)
resource "aws_iam_policy" "frontend_deploy" {
  name        = "docco-${var.environment}-frontend-deploy-policy"
  description = "Allows GitHub Actions to sync static assets to S3 and invalidate CloudFront cache"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation"
        ]
        Resource = var.cloudfront_distribution_arn
      }
    ]
  })
}

# Attach Policy to User
resource "aws_iam_user_policy_attachment" "attach" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.frontend_deploy.arn
}

# Access Key Pair for GitHub Actions Secrets
resource "aws_iam_access_key" "github_actions_key" {
  user = aws_iam_user.github_actions.name
}
