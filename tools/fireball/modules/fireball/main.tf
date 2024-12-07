locals {
  ports = concat(
    [
      4317,  // OLTP protobuf (write)
      16685, // OLTP grpc API (read)
      5778,  // HTTP sampling API
      5779,  // gRPC sampling API
      16686, // Web UI
    ],
    var.json ? [4318] : [],
    var.zipkin ? [9411] : [],
    var.legacy ? [
      14250, // legacy protobuf (write)
      14268, // legacy thrift (write)
    ] : []
  )
}

data "docker_image" "jaeger" {
  name = "jaegertracing/jaeger:${var.jaeger_version}"
}

resource "docker_volume" "config" {
  name = "jaeger-config"
}

resource "docker_container" "jaeger" {
  image = data.docker_image.jaeger.id
  name  = "fireball"
  command = [
    "--set", "receivers.otlp.protocols.http.endpoint=0.0.0.0:4318",
    "--set", "receivers.otlp.protocols.grpc.endpoint=0.0.0.0:4317"
  ]

  volumes {
    volume_name    = docker_volume.config.name
    container_path = "/etc/jaeger"
    host_path      = "${path.cwd}/.fireball/etc/jaeger"
  }

  dynamic "ports" {
    for_each = toset(local.ports)
    content {
      internal = ports.key
      external = ports.key
    }
  }
}
