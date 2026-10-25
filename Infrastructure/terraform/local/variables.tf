variable "cluster_name" {
  description = "Name of the local kind Kubernetes cluster"
  type        = string
  default     = "microsift"
}

variable "ingress_http_port" {
  description = "Host port mapped to the cluster Ingress controller"
  type        = number
  default     = 8089
}

variable "mailpit_http_port" {
  description = "Host port mapped to the Mailpit web UI"
  type        = number
  default     = 8026
}