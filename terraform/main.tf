terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_route53_zone" "masky" {
  name = var.zone_name
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

resource "aws_iam_role" "host" {
  name = "infinitemirror-host"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ssm_params" {
  name = "infinitemirror-ssm-read"
  role = aws_iam_role.host.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
      Resource = "arn:aws:ssm:${var.region}:*:parameter/infinitemirror/*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "host" {
  name = "infinitemirror-host"
  role = aws_iam_role.host.name
}

resource "aws_security_group" "host" {
  name        = "infinitemirror-host"
  description = "InfiniteMirror dashboard behind Pomerium"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTPS (Pomerium)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP (ACME + redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "host" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  iam_instance_profile   = aws_iam_instance_profile.host.name
  vpc_security_group_ids = [aws_security_group.host.id]
  subnet_id              = var.subnet_id

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    domain        = var.domain
    mcp_domain    = var.mcp_domain
    allowed_email = var.allowed_email
    repo_url      = var.repo_url
    region        = var.region
  })

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = { Name = "infinitemirror-host" }
}

resource "aws_eip" "host" {
  instance = aws_instance.host.id
  domain   = "vpc"
  tags     = { Name = "infinitemirror-host" }
}

resource "aws_route53_record" "dashboard" {
  zone_id = data.aws_route53_zone.masky.zone_id
  name    = var.domain
  type    = "A"
  ttl     = 60
  records = [aws_eip.host.public_ip]
}

resource "aws_route53_record" "mcp" {
  zone_id = data.aws_route53_zone.masky.zone_id
  name    = var.mcp_domain
  type    = "A"
  ttl     = 60
  records = [aws_eip.host.public_ip]
}

resource "aws_route53_record" "wildcard" {
  zone_id = data.aws_route53_zone.masky.zone_id
  name    = "*.${var.domain}"
  type    = "A"
  ttl     = 60
  records = [aws_eip.host.public_ip]
}
