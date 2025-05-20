variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "k8s_version" {
  default = "1.31"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnets" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  default = ["10.0.3.0/24"]
}

variable "cluster_name" {
  default = "rangeiq-cluster"
}

variable "project_name" {
  default = "rangeiq"
}
