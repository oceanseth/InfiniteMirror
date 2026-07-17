variable "region" {
  description = "AWS region (SSM parameters for the worker live here)"
  type        = string
  default     = "us-east-1"
}

variable "zone_name" {
  description = "Existing Route53 hosted zone"
  type        = string
  default     = "masky.ai"
}

variable "domain" {
  description = "FQDN for the dashboard"
  type        = string
  default     = "infinitemirror.masky.ai"
}

variable "allowed_email" {
  description = "Identity allowed through the Pomerium policy"
  type        = string
  default     = "seth@voicecert.com"
}

variable "repo_url" {
  description = "Public repo cloned onto the host at boot"
  type        = string
  default     = "https://github.com/oceanseth/InfiniteMirror"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "vpc_id" {
  description = "VPC to deploy into (masky-gbrain-production)"
  type        = string
  default     = "vpc-03e3f797004f25b12"
}

variable "subnet_id" {
  description = "Public subnet in the VPC"
  type        = string
  default     = "subnet-094e8acf0792a4d06"
}

variable "mcp_domain" {
  description = "FQDN for the Pomerium-gated MCP endpoint"
  type        = string
  default     = "mcp.infinitemirror.masky.ai"
}
