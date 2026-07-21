# SSL Enforced Parameter Group
resource "aws_db_parameter_group" "ssl" {
  name        = "docco-${var.environment}-pg-ssl-param-group"
  family      = "postgres16"
  description = "Forces SSL connections to PostgreSQL RDS"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name        = "docco-${var.environment}-pg-ssl-param-group"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Amazon RDS PostgreSQL Instance
resource "aws_db_instance" "this" {
  identifier             = "docco-${var.environment}-postgres"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = 100
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = var.db_name
  username = var.db_user
  password = var.db_password
  port     = 5432

  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.db_sg_id]
  parameter_group_name   = aws_db_parameter_group.ssl.name

  multi_az                = var.multi_az
  publicly_accessible     = false
  skip_final_snapshot     = true
  deletion_protection     = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  tags = {
    Name        = "docco-${var.environment}-postgres"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
