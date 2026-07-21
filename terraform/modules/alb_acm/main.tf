# Application Load Balancer
resource "aws_lb" "this" {
  name               = "docco-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false

  tags = {
    Name        = "docco-${var.environment}-alb"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Target Group pointing to Backend EC2 container port 5000
resource "aws_lb_target_group" "backend" {
  name        = "docco-${var.environment}-backend-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    enabled             = true
    path                = "/health"
    protocol            = "HTTP"
    port                = "5000"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }

  tags = {
    Name        = "docco-${var.environment}-backend-tg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Attach Backend EC2 to Target Group
resource "aws_lb_target_group_attachment" "backend" {
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = var.backend_instance_id
  port             = 5000
}

# HTTP Port 80 Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = var.enable_ssl ? "redirect" : "forward"

    target_group_arn = var.enable_ssl ? null : aws_lb_target_group.backend.arn

    dynamic "redirect" {
      for_each = var.enable_ssl ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

# ACM SSL Certificate (Conditional)
resource "aws_acm_certificate" "this" {
  count             = var.enable_ssl && var.domain_name != "" ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  tags = {
    Name        = "docco-${var.environment}-cert"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS Port 443 Listener (Conditional)
resource "aws_lb_listener" "https" {
  count             = var.enable_ssl && var.domain_name != "" ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.this[0].arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}
