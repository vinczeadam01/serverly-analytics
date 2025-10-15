# Serverly Analytics
## 3. High-Level Architecture

For a comprehensive deep dive (including scaling, failure modes, and extended diagrams) see: [Detailed Architecture](./docs/architecture.md).

```
Sources (Bind9 / Apache / Postfix / XEN Hosts) 
  -> Kafka (raw_logs + DLQ)
    -> Go Consumers (parse + aggregate)
      -> TimescaleDB (raw + aggregates + replica)
         ^
         | (SQL queries, optional Redis cache)
      Spring Boot API
         ^
         |
      Angular Frontend
```

Key Points:
- Single raw ingress stream; direct persistence (no parsed topic) for reduced latency.
- DLQ isolates parse failures for safe replay.
- Optional Redis cache accelerates hot aggregate queries.
- TimescaleDB replica serves read-heavy/reporting workloads.
- UI consumes only curated API responses (no direct DB or Kafka access).
 - Full system graph: see `docs/architecture.mmd` or the extended description in [Detailed Architecture](./docs/architecture.md).
- Hypertable: `events_agg_minute`
- Continuous aggregates: hourly / daily rollups (Timescale continuous aggregates)
- Retention policies (e.g., raw 7 days, minute 30 days, hourly 180 days) [Configurable]

### 4.5 Spring Boot REST API
- Layers: Controller → Service → Repository (JPA / SQL templates)
- Caching via Redis for hot queries
- Input validation + pagination + error handling
- Spring Security, user authentication

### 4.6 Angular Web Application
- Modules: Dashboard, DNS, Webhosting, Email, VPS
- State management (NgRx or Signals) [TBD]
- Reusable chart components (using Highcharts or Chart.js)

### 4.7 Infrastructure & Automation
- **Docker**: Containerized services & local orchestration
- **Salt**: Provisioning / secrets templating / environment bootstrap

---
## 5. Data Model (Indicative)

TODO

---
## 6. Ingestion Workflow
1. **Log Emit**: Application/service writes log line.
2. **Ship**: Agent tails file/journal → batches → Kafka `raw_logs`.
3. **Consume & Parse**: Go processor decodes (JSON / regex), normalizes severity & timestamps, enriches with host/service metadata.
4. **Validate**: If schema mismatch → send to `processing_dlq`.
5. **Persist**: Insert raw event rows (if within retention policy) and update in-memory aggregation buffers.
6. **Aggregate Flush**: At window boundary flush counters/statistics to `events_agg_minute` (and higher rollups via continuous aggregates).
7. **Expose**: API queries aggregates or (optionally) raw events.
8. **Visualize**: UI charts update via periodic polling or future streaming channel.

---
## 7. REST API Overview (Draft)
Base URL: `/api/v1`

### 7.1 Example Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness / readiness |
| GET | /metrics/summary?from=...&to=... | Global aggregated metrics |
| GET | /metrics/service/{service}?from=... | Service-level time-series |
| GET | /logs/search?q=...&from=...&to=...&level=... | Full-text / filtered search (paginated) |
| GET | /hosts | List known hosts |
| GET | /services | List services |

### 7.2 Sample Response (Service Metrics)
```json
{
  "service": "billing-api",
  "interval": "1m",
  "from": "2025-10-05T08:00:00Z",
  "to": "2025-10-05T09:00:00Z",
  "series": [
    { "ts": "2025-10-05T08:00:00Z", "total": 523, "errors": 4, "p95_latency_ms": 183.4 },
    { "ts": "2025-10-05T08:01:00Z", "total": 611, "errors": 2, "p95_latency_ms": 171.2 }
  ]
}
```

### 7.3 Pagination Strategy
- Cursor or offset-based (TBD). Recommend cursor (ts + id) for stable traversal.

### 7.4 Error Format (Proposed)
```json
{
  "timestamp": "2025-10-05T09:12:33.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid time range",
  "path": "/api/v1/metrics/summary"
}
```

---
## 8. Frontend (Angular) Features
- Global overview dashboard (TPS, error rate, top N services)
- Service deep-dive (latency, error distribution, host breakdown)
- Log search interface with filters & severity highlighting
- Time range quick selectors (Last 15m / 1h / 24h / Custom)
- Responsive layout for widescreen operations center displays
- Future: Alert rule configuration & notifications

---
## 9. Configuration & Environment Variables (Draft)
| Variable | Description | Example |
|----------|-------------|---------|
| `KAFKA_BROKERS` | Kafka bootstrap servers | `kafka:9092` |
| `KAFKA_SASL_USER` | SASL username (if enabled) | `analytics` |
| `KAFKA_SASL_PASS` | SASL password | `secret` |
| `DB_HOST` | TimescaleDB host | `timescaledb` |
| `DB_PORT` | Port | `5432` |
| `DB_USER` | Database user | `analytics` |
| `DB_PASSWORD` | Password | `change_me` |
| `DB_NAME` | Database name | `analytics` |
| `RETENTION_RAW_DAYS` | Raw event retention | `7` |
| `RETENTION_MINUTE_DAYS` | Minute agg retention | `30` |
| `RETENTION_HOURLY_DAYS` | Hourly agg retention | `180` |
| `API_PORT` | Spring Boot server port | `8080` |
| `GO_WORKER_COUNT` | Parallel consumer workers | `8` |
| `LOG_LEVEL` | Service log level | `INFO` |

---
## 10. Local Development with Docker

### 10.1 Quick Start

**Development Mode (with hot reload):**
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development environment (merge base + dev overrides)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Production Mode:**
```bash
# Start production environment
docker compose up -d
```

### 10.2 Environment Configuration

All environment variables are configured in `.env` file:

```bash
# Database Configuration
POSTGRES_DB=serverlydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_PORT=5433

# Backend Configuration
BACKEND_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# Frontend Configuration
FRONTEND_PORT=4200

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_at_least_256_bits_long
JWT_EXPIRATION=86400000
```

**Important:** Never commit `.env` to version control! Use `.env.example` as a template.

### 10.3 Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Hot Reload** | ✅ Enabled (backend & frontend) | ❌ Disabled |
| **Volume Mounts** | ✅ Source code mounted | ❌ Code copied in build |
| **Image Size** | Larger (includes build tools) | Smaller (optimized) |
| **Spring DevTools** | ✅ Enabled | ❌ Disabled |
| **Angular** | `ng serve --poll` | `nginx` static files |
| **Build Time** | Faster (cached deps) | Slower (full build) |
| **Remote Debug** | ✅ Port 5005 (backend) | ❌ Not exposed |

### 10.4 Development Workflow

**Backend Hot Reload:**
1. Edit Java files in `backend/src/`
2. Spring Boot DevTools auto-reloads changes
3. No container restart needed!

**Frontend Hot Reload:**
1. Edit Angular files in `frontend/src/`
2. Angular CLI detects changes (polling enabled for Docker)
3. Browser auto-refreshes
4. No container restart needed!

### 10.5 Useful Commands

```bash
# View logs
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

# Rebuild after dependency changes
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Stop all containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Remove volumes (clean database)
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Access database (service name works with compose v2)
docker compose exec postgres psql -U postgres -d serverlydb
```

### 10.6 Ports

| Service | Development Port | Production Port |
|---------|------------------|-----------------|
| PostgreSQL | 5433 | 5433 |
| Backend | 8080 | 8080 |
| Frontend | 4200 | 4200 (mapped to 80) |
| Backend Debug | 5005 | N/A |

### 10.7 Docker Compose Architecture (Indicative)
Below is an indicative `docker-compose.yml` fragment (not final):
```yaml
version: "3.9"
services:
  kafka:
    image: bitnami/kafka:latest
    environment:
      - KAFKA_ENABLE_KRAFT=yes
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    ports:
      - "9092:9092"

  timescaledb:
    image: timescale/timescaledb-ha:pg16-latest
    environment:
      POSTGRES_USER: analytics
      POSTGRES_PASSWORD: change_me
      POSTGRES_DB: analytics
    ports:
      - "5432:5432"

  go-processor:
    build: ./go-processor
    environment:
      KAFKA_BROKERS: kafka:9092
      DB_HOST: timescaledb
      DB_USER: analytics
      DB_PASSWORD: change_me
      DB_NAME: analytics
    depends_on:
      - kafka
      - timescaledb

  api:
    build: ./api
    environment:
      DB_HOST: timescaledb
      DB_USER: analytics
      DB_PASSWORD: change_me
      DB_NAME: analytics
      API_PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      - timescaledb

  web:
    build: ./web
    ports:
      - "4200:80"
    depends_on:
      - api
```
> NOTE: Add production-grade configurations (auth, TLS, resource limits) before real deployment.

---
## 11. Scalability Considerations
| Layer | Strategy |
|-------|----------|
| Ingestion | Kafka partition scaling; multiple Go consumer groups |
| Parsing | Parallel goroutines, bounded queues, backpressure via Kafka lag |
| Storage | TimescaleDB compression & chunk sizing tuning |
| API | Horizontal scaling behind load balancer; caching layer |
| Frontend | CDN hosting of static Angular build |
| Multi-Region (Future) | Mirror topics + cross-region replication |

---
## 12. Reliability & Fault Tolerance
- At-least-once delivery via Kafka semantics
- DLQ (`processing_dlq`) for poison messages
- Idempotent upserts for aggregate commits
- Graceful shutdown hooks flush in-memory windows
- Health endpoints: liveness vs readiness separation
- Optional: Circuit breaker / retry policies on DB writes (future)

---
## 13. Security & Compliance (Planned)
- TLS termination for API & UI
- Kafka auth: SASL/SCRAM or mTLS
- Audit logging for administrative actions
- Secrets management via Salt pillar / Vault integration (future)
- Data minimization: drop PII fields at parse stage when possible

---
## 14. Observability
- Service logs in standardized JSON
- Prometheus metrics (for Kafka metrics)
- Tracing integration (OpenTelemetry) future phase
- Dashboard templates: ingestion lag, parse error rate, DB write latency

---
## 15. License
License: Apache 2.0

---
## 18. Acknowledgements
This project serves as a diploma (thesis) work focused on designing and implementing an end-to-end, scalable log analytics pipeline for enterprise environments. Inspired by patterns from modern observability stacks (ELK/EFK, Prometheus, Loki, OpenTelemetry) while emphasizing educational clarity and architectural modularity.
