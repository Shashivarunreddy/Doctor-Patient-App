output "endpoint" {
  description = "Connection endpoint for RDS PostgreSQL"
  value       = aws_db_instance.this.endpoint
}

output "address" {
  description = "Hostname address of RDS PostgreSQL"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Port of RDS PostgreSQL"
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.this.db_name
}
