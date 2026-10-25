terraform {
  required_version = "= 1.15.9"

  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "= 0.8.0"
    }
  }
}