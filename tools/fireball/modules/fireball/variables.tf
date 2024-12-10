variable "json" {
  description = "Whether or not to expose the OLTP JSON API on 4318"
  type        = bool
  default     = false
}

variable "zipkin" {
  description = "Whether or not to expose the Zipkin API on 9411"
  type        = bool
  default     = false
}

variable "legacy" {
  description = "Whether or not to expose legacy APIs"
  type        = bool
  default     = false
}

variable "jaeger_version" {
  description = "Jaeger version"
  type        = string
  default     = "2.0.0"
}
