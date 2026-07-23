# Observability Stack (Prometheus & Grafana)

This document describes the design, configuration, metrics collection, and data persistence of the self-hosted Docco360 observability platform.

---

## Purpose
This document provides details on how the monitoring stack evaluates system metrics, tracks container resources, and visualizes application availability using Prometheus and Grafana.

## Scope
The scope covers Prometheus scraping targets, alert definitions, Grafana configuration provisioning, Node Exporter host metrics, cAdvisor Docker metrics, and persistent storage mappings on AWS EBS.

---

## Observability Architecture

The monitoring infrastructure operates as a decoupled stack hosted alongside the application components but deployed on separate virtual networks.

```text
                  +-----------------------------------+
                  |           Linux Host              |
                  |  (Node Exporter / cAdvisor / API) |
                  +-----------------+-----------------+
                                    |
                                    | (Pull Metrics)
                                    v
                  +-----------------+-----------------+
                  |      Prometheus Container         |
                  |    (Time-Series Database)         |
                  +-----------------+-----------------+
                                    |
                                    | (Query / Read)
                                    v
                  +-----------------+-----------------+
                  |       Grafana Container           |
                  |     (Visual Dashboards)           |
                  +-----------------+-----------------+
                                    |
                                    v
                         [ Persistent Storage ]
                         (AWS EBS: /mnt/monitoring)
```

---

## Component Specifications

### 1. Prometheus Server
Prometheus serves as the scraper and time-series database. It is configured to poll targets at regular intervals.

#### Configuration (`prometheus/prometheus.yml`)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert.rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'flask-backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:5000']
```

### 2. Node Exporter
Exposes system-level metrics from the host operating system namespace. Captures CPU core utilization, memory buffers, swap spaces, disk I/O metrics, and network interfaces throughput.

### 3. cAdvisor
Analyzes resource usage and performance characteristics of all running Docker containers. Captures container CPU shares, memory RSS limits, transmit/receive packet volume, and container lifecycle events (e.g. OOM kills).

### 4. Grafana Visualizations
Grafana loads dashboards from JSON configurations. Standard dashboards include:
* **Host Health Dashboard**: Details CPU load, RAM utilization, and disk exhaustion times.
* **Container Resource Dashboard**: Charts per-container memory footprints and runtime restart metrics.
* **API Performance Dashboard**: Charts request counts, error percentages, latency distributions, and active connections.

---

## Persistent Storage Configuration (AWS EBS)

To ensure monitoring logs and Grafana layouts survive container re-creations, updates, and EC2 reboots, data is written to an attached **Amazon EBS** volume mounted at `/mnt/monitoring`.

### Docker Volume Mappings
```yaml
services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: docco_prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - /mnt/monitoring/prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'

  grafana:
    image: grafana/grafana:10.0.1
    container_name: docco_grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=SecureProductionAdminPassword
    volumes:
      - /mnt/monitoring/grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
```

---

## Alert Rules (`prometheus/alert.rules.yml`)

Prometheus monitors metric values against threshold states, generating alerts when boundaries are crossed.

```yaml
groups:
  - name: docco_infrastructure_alerts
    rules:
      - alert: HostCpuUtilizationHigh
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Host CPU utilization is above 85% on {{ $labels.instance }}"

      - alert: TargetInstanceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Instance target {{ $labels.instance }} has been unreachable for more than 2 minutes."
```

---

## Operational Verification

Verify the Prometheus targets status from the server interface.

> Screenshot:
>
> Prometheus Scrape Targets Status

Verify that Grafana is displaying live dashboard data.

> Screenshot:
>
> Grafana Main Dashboard
