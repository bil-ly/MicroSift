resource "kind_cluster" "this" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    # Node 1: The Boss (Control Plane) + Front Door port tunnels
    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 80
        host_port      = var.ingress_http_port
        listen_address = "127.0.0.1"
        protocol       = "TCP"
      }

      extra_port_mappings {
        container_port = 30025
        host_port      = var.mailpit_http_port
        listen_address = "127.0.0.1"
        protocol       = "TCP"
      }
    }

    # Node 2: Worker Server #1
    node {
      role = "worker"
    }

    # Node 3: Worker Server #2
    node {
      role = "worker"
    }

    # Node 4: Worker Server #3 (optional - include if you want 4 nodes total!)
    node {
      role = "worker"
    }
  }
}