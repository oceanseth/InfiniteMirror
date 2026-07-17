output "url" {
  value = "https://${var.domain}"
}

output "public_ip" {
  value = aws_eip.host.public_ip
}

output "instance_id" {
  description = "Debug via: aws ssm start-session --target <id>"
  value       = aws_instance.host.id
}
