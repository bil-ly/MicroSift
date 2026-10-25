output "cluster_name" {
  description = "The name of the provisioned kind cluster"
  value       = kind_cluster.this.name
}

output "kubeconfig_path" {
  description = "Path to the kubeconfig file updated by kind"
  value       = kind_cluster.this.kubeconfig_path
}