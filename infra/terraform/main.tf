terraform {
  required_version = ">= 1.5"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }

  backend "s3" {
    bucket = "homework-platform-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

variable "environment" {
  type        = string
  description = "Environment: staging or production"
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}

variable "data_region" {
  type        = string
  description = "Data region: us or eu"
  default     = "us"
  validation {
    condition     = contains(["us", "eu"], var.data_region)
    error_message = "Data region must be us or eu."
  }
}

variable "vercel_api_token" {
  type      = string
  sensitive = true
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "redis_url" {
  type      = string
  sensitive = true
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "clerk_secret_key" {
  type      = string
  sensitive = true
}

variable "resend_api_key" {
  type      = string
  sensitive = true
}

# Vercel project for the web app
resource "vercel_project" "web" {
  name      = "homework-platform-${var.environment}"
  framework = "nextjs"

  environment = [
    {
      key    = "DATABASE_URL"
      value  = var.database_url
      target = [var.environment == "production" ? "production" : "preview"]
    },
    {
      key    = "REDIS_URL"
      value  = var.redis_url
      target = [var.environment == "production" ? "production" : "preview"]
    },
    {
      key    = "OPENAI_API_KEY"
      value  = var.openai_api_key
      target = [var.environment == "production" ? "production" : "preview"]
    },
    {
      key    = "CLERK_SECRET_KEY"
      value  = var.clerk_secret_key
      target = [var.environment == "production" ? "production" : "preview"]
    },
    {
      key    = "RESEND_API_KEY"
      value  = var.resend_api_key
      target = [var.environment == "production" ? "production" : "preview"]
    },
    {
      key    = "DATA_REGION"
      value  = var.data_region
      target = [var.environment == "production" ? "production" : "preview"]
    },
  ]
}

output "vercel_project_id" {
  value = vercel_project.web.id
}
