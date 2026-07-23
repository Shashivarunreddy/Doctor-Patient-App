resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "docco-${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name        = "docco-${var.environment}-igw"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "docco-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Public"
    ManagedBy   = "Terraform"
  }
}

# Private Application Subnets
resource "aws_subnet" "private_app" {
  count             = length(var.private_app_subnet_cidrs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "docco-${var.environment}-private-app-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Private-App"
    ManagedBy   = "Terraform"
  }
}

# Private Database Subnets
resource "aws_subnet" "private_db" {
  count             = length(var.private_db_subnet_cidrs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "docco-${var.environment}-private-db-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "Private-DB"
    ManagedBy   = "Terraform"
  }
}

# NAT Gateway Elastic IP
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "docco-${var.environment}-nat-eip"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# NAT Gateway (placed in first public subnet)
resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "docco-${var.environment}-nat-gw"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  depends_on = [aws_internet_gateway.this]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name        = "docco-${var.environment}-public-rt"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Private App Route Table
resource "aws_route_table" "private_app" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }

  tags = {
    Name        = "docco-${var.environment}-private-app-rt"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_app" {
  count          = length(aws_subnet.private_app)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app.id
}

# Database Subnet Group for RDS
resource "aws_db_subnet_group" "db" {
  name        = "docco-${var.environment}-db-subnet-group"
  subnet_ids  = aws_subnet.private_db[*].id
  description = "Database subnet group for Docco360 RDS"

  tags = {
    Name        = "docco-${var.environment}-db-subnet-group"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Gateway Endpoint for Amazon S3 (reduces NAT Gateway billing data processing costs)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private_app.id]

  tags = {
    Name        = "docco-${var.environment}-s3-endpoint"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

data "aws_region" "current" {}
