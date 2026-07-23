output "bastion_public_ip" {
  description = "Public IP address of Bastion Host"
  value       = aws_instance.bastion.public_ip
}

output "backend_private_ip" {
  description = "Private IP address of Backend EC2 instance"
  value       = aws_instance.backend.private_ip
}

output "backend_instance_id" {
  description = "ID of Backend EC2 instance"
  value       = aws_instance.backend.id
}
