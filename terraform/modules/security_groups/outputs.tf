output "alb_sg_id" {
  description = "Security Group ID for ALB"
  value       = aws_security_group.alb.id
}

output "bastion_sg_id" {
  description = "Security Group ID for Bastion Host"
  value       = aws_security_group.bastion.id
}

output "backend_sg_id" {
  description = "Security Group ID for Backend EC2"
  value       = aws_security_group.backend.id
}

output "db_sg_id" {
  description = "Security Group ID for RDS Database"
  value       = aws_security_group.db.id
}
