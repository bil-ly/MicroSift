resource "kind_cluster" "this" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      # Forward port 8088 on your laptop -> port 80 inside the cluster (for app.localhost:8088 & auth.localhost:8088)
      extra_port_mappings {
        container_port = 80
        host_port      = var.ingress_http_port
        listen_address = "127.0.0.1"
        protocol       = "TCP"
      }
    }
  }