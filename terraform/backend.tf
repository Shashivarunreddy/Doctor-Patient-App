# Remote Backend Configuration Template
# To enable S3 remote state storage with DynamoDB state locking:
# 1. Create S3 bucket and DynamoDB table
# 2. Uncomment the block below and run: terraform init

/*
terraform {
  backend "s3" {
    bucket         = "docco360-v2-tfstate-bucket"
    key            = "v2/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "docco360-v2-tflocks"
    encrypt        = true
  }
}
*/
