output "name" {
  description = "The name of the docker container"
  value       = docker_container.jaeger.name
}

output "otlp_grpc_endpoint" {
  description = "The endpoint for OTLP GRPC"
  value       = "localhost:4317"
}

output "otlp_json_endpoint" {
  description = "The endpoint for OTLP JSON"
  value       = var.json ? "localhost:4317" : null
}

output "ui_url" {
  description = "The URL for the Jaeger UI"
  value       = "http://localhost:16686"
}
