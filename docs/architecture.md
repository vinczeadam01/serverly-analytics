# Detailed Architecture

This document expands on the high-level overview in the root `README.md`, providing deeper insight into producers, streaming layer, processing, storage, query path, scalability, resilience, and evolution options.

> Quick jump: [Data Model](../README.md#5-data-model-indicative) · [Ingestion Workflow](../README.md#6-ingestion-workflow) · [API Overview](../README.md#7-rest-api-overview-draft)

---
## 1. Component Landscape
| Domain | Components | Notes |
|--------|-----------|-------|
| Producers | Bind9 DNS, Apache Web, Postfix Mail, XEN VPS Hosts | Heterogeneous log formats (text, combined, syslog) |
| Streaming | Kafka Cluster (3 brokers) | Topics: `raw_logs`, `processing_dlq` |
| Processing | Go Consumers (scalable pods) | Parsing, enrichment, window aggregation, DLQ routing |
| Storage (Primary) | TimescaleDB (PostgreSQL + Timescale extension) | Raw + minute aggregates + continuous aggregates |
| Storage (Replica) | TimescaleDB Replica | Read scaling, analytics queries |
| Cache (Optional) | Redis | Hot range & metadata caching |
| API Layer | Spring Boot REST API | Query orchestration, auth, validation |
| UI | Angular Frontend | Visualization, interaction, dashboards |

---
## 2. Core Data Flow
```
Bind9 / Apache / Postfix / XEN Hosts
   -> (Agents / Shippers) -> Kafka raw_logs (partitioned by service|host)
       -> Go Consumers (batch poll N messages)
            -> Parse & Enrich -> (bulk insert raw rows*)
            -> Update in-memory minute windows
            -> On window close -> Flush aggregates to timescale
            -> Failures -> processing_dlq
                * raw row insert optional (governed by retention policy)
```

Sequence (successful path):
1. Emit line → ship to Kafka with routing key.
2. Consumer poll → decode → classify severity.
3. Enrich (host tags, service, optional trace correlation).
4. Buffer in memory (keyed by (service, minute)).
5. Flush thresholds (time or count) → bulk insert.
6. API layer queries `events_agg_minute` primarily; drills into raw if needed.

---
## 3. Aggregation Strategy
| Level | Mechanism | Purpose | Retention (example) |
|-------|-----------|---------|---------------------|
| Raw Events | Direct inserts | Detailed for drill-down | 7 days |
| Minute | In-memory window → table | Visualization baseline | 30 days |
| Hour | Timescale continuous aggregate | Trend analysis | 180 days |
| Day | Timescale continuous aggregate | Capacity planning | 400 days |

Future: Introduce histogram buckets (latency) using `approx_percentile` or HyperLogLog for uniques.

---
## 4. Kafka Topic Design
| Topic | Key | Partitions | Purpose | Notes |
|-------|-----|-----------|---------|-------|
| `raw_logs` | `service|host` composite | N (scaled with throughput) | Ingestion buffer | Retain long enough for replay/window recovery |
| `processing_dlq` | message id | Low (e.g., 1–3) | Store parse failures | Triggers alerting when growth rate spikes |

Offset commit mode: at-least-once. Idempotency for aggregates by composite key `(bucket_start, service, host)` ensures safe retries.

---
## 5. Parsing & Enrichment Pipeline
Pipeline stages inside the Go consumer:
1. Input batch fetch
2. Line classification (format detection heuristics / pre-configured patterns)
3. Parsing (regex, JSON unmarshal, key=value tokenization)
4. Enrichment (host metadata cache, severity normalization, timestamp harmonization)
5. Validation (required fields present?)
6. DLQ routing on failure (with truncated original payload)
7. Window aggregation update
8. Bulk flush

Extensibility: implement `Parser` interface `{ Detect([]byte) bool; Parse([]byte) (Event, error) }` and register in a chain.

---
## 6. TimescaleDB Schema Concepts
- Hypertables: `events_raw`, `events_agg_minute`
- Continuous aggregates: `events_agg_hour`, `events_agg_day`
- Indexing:
  - `(ts DESC)` BRIN for raw (space-efficient)
  - `(service, bucket_start)` B-Tree for aggregates
- Compression:
  - Enable compression for aged chunks (e.g., >7 days for minute aggregates)
- Retention policies via Timescale background jobs.

---
## 7. Query Path
```
UI -> API -> (Cache?) -> TimescaleDB
                     -> Fallback to raw on drill-down
```
Caching tiers (optional):
- Metadata lists (hosts/services) in Redis (TTL 30–60s)
- Recent minute windows (rolling last 60m) cached by `(service, resolution)`

---
## 8. Failure & Recovery Scenarios
| Failure | Impact | Mitigation | Recovery Action |
|---------|--------|-----------|-----------------|
| Consumer crash | Lag growth | Stateless horizontal scaling | Restart pod, resume from last committed offset |
| Parse regression | DLQ spike | Canary deploy + feature flags | Patch parser, replay DLQ subset |
| Timescale primary down | Write stall | Promote replica (future automation) | Manual failover or Patroni cluster |
| Kafka broker loss | Reduced ISR | Replication factor ≥2 | Broker replace & partition reassignment |
| Cache outage | Higher DB load | Graceful fallback logic | Rebuild warm cache on demand |

---
## 9. Security Considerations (Planned)
| Layer | Control |
|-------|---------|
| Agents → Kafka | mTLS / SASL SCRAM |
| Kafka ACLs | Producer limited to `raw_logs`, consumer limited to `raw_logs` + DLQ |
| Processor → DB | Least-privilege role (INSERT raw, UPSERT aggregates) |
| API → DB | Read-only role for aggregates + controlled raw access |
| UI → API | OAuth2 / OIDC (future) |

---
## 10. Observability Stack (Future Enablers)
| Metric | Source | Use |
|--------|--------|-----|
| Kafka consumer lag | Processor + Kafka exporter | Backpressure SLO |
| Parse error rate | Processor | Alert on format regressions |
| Insert latency | Processor | DB performance tuning |
| Query latency P95 | API | Capacity planning |
| Cache hit ratio | API / Redis | Cache sizing |

Tracing (future): OpenTelemetry spans: `agent.produce`, `processor.consume`, `db.insert`, `api.query`.

---
## 11. Evolution Options
| Option | Description | Trade-offs |
|--------|-------------|-----------|
| Add parsed topic | Insert `parsed_logs` between processor & aggregator | Higher latency vs easier replay /
| Adopt Flink / Kafka Streams | Externalize stateful windowing | Operational complexity |
| Introduce Alert Engine | Real-time threshold evaluation | Increased infra + rule mgmt |
| Object Store Archive | Offload cold raw chunks to S3 | Additional ingestion for replays |
| Multi-tenant Partitioning | Per-tenant topic namespaces | Operational overhead |

---
## 12. Mermaid Master Diagram
> (Same as `architecture.mmd` but embedded for documentation completeness.)

```mermaid
%% Included primary system view
flowchart LR
  subgraph Sources[Server Estate / Producers]
    DNS1[Bind9 DNS Server]
    WEB1[Apache Web Server]
    MAIL1[Postfix Mail Server]
    VPS1[XEN Host 1]
    VPS2[XEN Host 2]
  end

  subgraph KafkaCluster[Kafka Cluster]
    K1[(Broker 1)]
    K2[(Broker 2)]
    K3[(Broker 3)]
  end

  subgraph Processing[Log Processing Layer]
    GO1[Go Consumer Pod 1]
    GO2[Go Consumer Pod 2]
    DLQ[(processing_dlq)]
  end

  subgraph Storage[Time-Series & Cache]
    TS1[(TimescaleDB Primary)]
    TS2[(TimescaleDB Replica)]
    REDIS[(Redis Cache)]
  end

  subgraph Backend[Application API]
    API[Spring Boot REST API]
  end

  subgraph Frontend[User Interface]
    UI[Angular Frontend]
  end

  DNS1 -- raw_logs --> K1
  WEB1 -- raw_logs --> K2
  MAIL1 -- raw_logs --> K3
  VPS1 -- raw_logs --> K1
  VPS2 -- raw_logs --> K2

  K1 <-- replication --> K2
  K2 <-- replication --> K3
  K1 <-- replication --> K3

  K1 --> GO1
  K2 --> GO2
  K3 --> GO1
  GO1 -- parse fail --> DLQ
  GO2 -- parse fail --> DLQ

  GO1 --> TS1
  GO2 --> TS1
  TS1 --> TS2

  API --> TS1
  API --> REDIS
  REDIS -. cache invalidation .-> API

  UI --> API

  classDef storage fill=#ddeeff,stroke=#003366,color=#000;
  classDef compute fill=#e8ffe8,stroke=#2d662d,color=#000;
  classDef broker fill=#fff2cc,stroke=#cc9900,color=#000;
  classDef cache fill=#f0e0ff,stroke=#5a2d82,color=#000;

  class TS1,TS2 storage;
  class GO1,GO2 compute;
  class K1,K2,K3 broker;
  class REDIS cache;
```

---
## 13. Cross-References
- Back to root overview: [README](../README.md)
- Data modeling details: see `README` Section 5
- Ingestion Workflow narrative: see `README` Section 6

---
## 14. Open Questions
| Topic | Question |
|-------|----------|
| Replay | Will raw Kafka retention suffice for historical rebuilds? |
| Auth | Keycloak vs simple API key initial implementation? |
| Cache | Introduce Redis early or defer until load test? |
| Alerting | Embed in processor or separate rule engine? |

---
## 15. Status
Document version: 0.1 (initial detailed architecture draft)
