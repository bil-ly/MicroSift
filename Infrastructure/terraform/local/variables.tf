variable "cluster_name" {
  description = "Name of the local kind Kubernetes cluster"
  type        = string
  default     = "microsift"
}

variable "ingress_http_port" {
  description = "Host port mapped to the cluster Ingress controller"
  type        = number
  default     = 8088
}