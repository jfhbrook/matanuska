data "docker_image" "jaeger" {
  name = "jaegertracing/jaeger:2.0.0"
}

/*
resource "docker_volume" "jaeger" {
  name = "jaeger"
}
*/

resource "docker_container" "jaeger" {
  image = data.docker_image.jaeger.id
  name = "fireball"
  /*
  volumes {
    volume_name = docker_volume.jaeger.name
    container_path = ""
  }
  */
  ports {
    internal = 4317
    external = 4317
  }

  ports {
    internal = 16686
    external = 16686
  }
}
