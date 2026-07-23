# 1. Custom VPC & Subnets Module
module "vpc" {
  source                   = "./modules/vpc"
  environment              = var.environment
  vpc_cidr                 = var.vpc_cidr
  public_subnet_cidrs      = var.public_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs
}

# 2. Stateful Security Groups Module
module "security_groups" {
  source      = "./modules/security_groups"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  admin_ip    = var.admin_ip
}

# 3. Compute & Persistent Storage Module
module "ec2" {
  source            = "./modules/ec2"
  environment       = var.environment
  public_subnet_id  = module.vpc.public_subnet_ids[0]
  private_subnet_id = module.vpc.private_app_subnet_ids[0]
  bastion_sg_id     = module.security_groups.bastion_sg_id
  backend_sg_id     = module.security_groups.backend_sg_id
  instance_type     = var.instance_type
  ssh_public_key    = var.ssh_public_key
}

# 4. Managed PostgreSQL Database Module
module "rds" {
  source               = "./modules/rds"
  environment          = var.environment
  db_subnet_group_name = module.vpc.db_subnet_group_name
  db_sg_id             = module.security_groups.db_sg_id
  db_name              = var.db_name
  db_user              = var.db_user
  db_password          = var.db_password
}

# 5. Load Balancing & Delivery Module
module "alb_acm" {
  source              = "./modules/alb_acm"
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  alb_sg_id           = module.security_groups.alb_sg_id
  backend_instance_id = module.ec2.backend_instance_id
  domain_name         = var.domain_name
  enable_ssl          = var.enable_ssl
}

# 6. S3 Static Hosting & CloudFront CDN Module
module "s3_cloudfront" {
  source      = "./modules/s3_cloudfront"
  environment = var.environment
}

# 7. IAM & Programmatic Deployment User Module
module "iam" {
  source                      = "./modules/iam"
  environment                 = var.environment
  s3_bucket_arn               = module.s3_cloudfront.bucket_arn
  cloudfront_distribution_arn = "arn:aws:cloudfront::*:distribution/${module.s3_cloudfront.cloudfront_distribution_id}"
}
