output "user_arn" {
  description = "ARN of GitHub Actions IAM user"
  value       = aws_iam_user.github_actions.arn
}

output "access_key_id" {
  description = "Access Key ID for GitHub Actions secret"
  value       = aws_iam_access_key.github_actions_key.id
}

output "secret_access_key" {
  description = "Secret Access Key for GitHub Actions secret"
  value       = aws_iam_access_key.github_actions_key.secret
  sensitive   = true
}
