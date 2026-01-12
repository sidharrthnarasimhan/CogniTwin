# CogniTwin Technical Implementation Document

## 1. System Overview and Principles

CogniTwin is a multi-tenant SaaS that:

- Ingests data from external systems (Shopify, Stripe, QuickBooks, POS, CRM, etc.)
- Normalizes it into a canonical business schema
- Builds and maintains a "digital twin" of each business (entities + relationships + KPIs)
- Computes features, forecasts, and runs simulations
- Uses an LLM Council to generate multi-agent insights
- Exposes APIs + web UI for operators

### Key Principles

- **Separation of concerns**: Ingestion, modeling, forecasting, simulation, and insights are separate services
- **Event-driven**: Data flows through queues; services react to events
- **Multi-tenant**: Tenant isolation in DB and config
- **Extensible**: Industry modules plug in without changing the core

## 2. High-Level Architecture

```text
                        ┌───────────────────────────────┐
                        │           Web App             │
                        │  (Next.js/React frontend)     │
                        └──────────────┬────────────────┘
                                       │ HTTPS (REST/GraphQL)
                         ┌─────────────▼──────────────┐
                         │        API Gateway         │
                         │ (Auth, routing, throttling)│
                         └─────────────┬──────────────┘
       ┌───────────────────────────────┼───────────────────────────────────┐
       │                               │                                   │
┌──────▼───────────┐         ┌─────────▼─────────┐               ┌────────▼──────────┐
│ Business Twin    │         │ Scenario Service  │               │ Insight Service   │
│ Service          │         │ (sim requests)    │               │ (LLM Council API) │
└──────┬───────────┘         └─────────┬─────────┘               └────────┬──────────┘
       │                                 │                                │
       │                                 │                                │
┌──────▼───────────┐        ┌───────────▼───────────┐        ┌───────────▼───────────┐
│ Digital Twin DB  │        │ Simulation Engine     │        │ LLM Council Orchestr. │
│ (Graph + SQL)    │        │ (Python service)      │        │ (Python/Node)         │
└──────┬───────────┘        └───────────┬───────────┘        └───────────┬───────────┘
       │                                 │                                │
       │                ┌────────────────▼─────────────┐                  │
       │                │ Forecasting Service          │                  │
       │                │ (ML models)                  │                  │
       │                └───────────────┬──────────────┘                  │
       │                                │                                 │
┌──────▼───────────┐       ┌────────────▼────────────┐         ┌─────────▼────────────┐
│ Feature Store    │       │ Forecast Store          │         │ Insights Store       │
│ (Redis/Feast)    │       │ (SQL/NoSQL)            │         │ (SQL/Doc DB)         │
└──────┬───────────┘       └────────────┬────────────┘         └─────────┬────────────┘
       │                                │                                 │
       └────────────────────────────────┼─────────────────────────────────┘
                                        │
                             ┌──────────▼──────────┐
                             │ Canonical Data DB   │
                             │ (Postgres)          │
                             └──────────┬──────────┘
                                        │
                             ┌──────────▼──────────┐
                             │ Schema Normalizer   │
                             └──────────┬──────────┘
                                        │
                             ┌──────────▼──────────┐
                             │ Raw Data Store      │
                             │ (S3/GCS)            │
                             └──────────┬──────────┘
                                        │
                          ┌─────────────▼─────────────┐
                          │ Ingestion Orchestrator    │
                          │ (Workers + Queue)         │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────────┐
             │                          │                             │
       ┌─────▼─────┐             ┌──────▼──────┐               ┌──────▼───────┐
       │ Shopify   │             │ Stripe      │               │ GA / CRM    │
       │ Connector │             │ Connector   │               │ Connectors  │
       └───────────┘             └─────────────┘               └─────────────┘
```

## 3. Data Model

### 3.1 Core Entities (Canonical Data)

In Postgres, multi-tenant via `tenant_id` on all tables.

**Tables:**

- **tenants**: `id`, `name`, `plan`, `created_at`
- **data_sources**: `id`, `tenant_id`, `type`, `config_json`, `status`
- **customers**: `id`, `tenant_id`, `external_ids JSONB`, `email`, `segment`, `created_at`
- **orders**: `id`, `tenant_id`, `customer_id`, `external_ids`, `status`, `total_amount`, `currency`, `ordered_at`
- **order_items**: `id`, `order_id`, `product_id`, `quantity`, `unit_price`
- **products**: `id`, `tenant_id`, `sku`, `name`, `category`, `cost`, `price`
- **transactions**: `id`, `tenant_id`, `order_id`, `payment_provider`, `amount`, `status`, `paid_at`
- **events**: `id`, `tenant_id`, `type`, `payload JSONB`, `occurred_at`
- **staff**: `id`, `tenant_id`, `role`, `location_id`, `cost_per_hour`, `metadata`

### 3.2 Digital Twin Model

**Graph Nodes:**
- `Business`, `Customer`, `Order`, `Product`, `Location`, `Staff`, `CostCenter`

**Relationships:**
- `(:Business)-[:OWNS]->(:Location)`
- `(:Customer)-[:PLACED]->(:Order)`
- `(:Order)-[:CONTAINS]->(:Product)`
- `(:Order)-[:PAID_VIA]->(:Transaction)`
- `(:Location)-[:STAFFED_BY]->(:Staff)`
- `(:Business)-[:HAS_COST_CENTER]->(:CostCenter)`

## 4. Services Architecture

### 4.1 API Gateway
- **Tech**: Node.js, Express, TypeScript
- **Responsibilities**: JWT auth, routing, rate limiting, request validation
- **Port**: 3000

### 4.2 Business Twin Service
- **Tech**: Node.js, TypeScript
- **DB**: PostgreSQL + Neo4j
- **Endpoints**:
  - `GET /twin/state`
  - `GET /twin/kpis`
- **Port**: 3001

### 4.3 Scenario Service
- **Tech**: Node.js, TypeScript
- **Endpoints**:
  - `POST /scenarios`
  - `GET /scenarios/:id`
- **Port**: 3002

### 4.4 Insight Service
- **Tech**: Node.js, TypeScript
- **Endpoints**:
  - `GET /insights`
  - `POST /insights/generate`
- **Port**: 3003

### 4.5 Forecasting Service
- **Tech**: Python, FastAPI
- **ML**: Prophet, PyTorch, scikit-learn
- **Port**: 8001

### 4.6 Simulation Engine
- **Tech**: Python, FastAPI
- **Port**: 8002

### 4.7 Ingestion Orchestrator
- **Tech**: Node.js, TypeScript
- **Queue**: Kafka / SQS
- **Storage**: S3/GCS

### 4.8 Schema Normalizer
- **Tech**: Node.js, TypeScript
- **Queue**: Kafka / SQS

## 5. LLM Council Architecture

### 5.1 Agents

Each agent is a specialized prompt + LLM call:

1. **Analyst**: Data-driven insights, trend analysis
2. **Operator**: Practical execution, operational efficiency
3. **Strategist**: Long-term planning, strategic opportunities
4. **Risk Officer**: Risk assessment, threat identification
5. **Industry Expert**: Domain-specific knowledge
6. **Synthesizer**: Aggregates all perspectives into final insights

### 5.2 Council Flow

```text
[Insight Service]
      |
      v
[LLM Council Orchestrator]
      |
      +--> Analyst Agent
      +--> Operator Agent
      +--> Strategist Agent
      +--> Risk Officer Agent
      +--> Industry Expert Agent
      |
      v
 Synthesizer Agent (aggregates all)
      |
      v
 Return final insights (JSON)
```

### 5.3 Input Payload

```json
{
  "tenant_id": "t_123",
  "business_snapshot": {
    "kpis": { "mrr": 50000, "growth_rate": 0.04 },
    "forecasts": [],
    "scenarios": [],
    "risks": []
  },
  "context": {
    "industry": "saas",
    "time_range": "next_90_days",
    "insight_type": "summary"
  }
}
```

## 6. Industry Modules

Each module implements:

```python
class IndustryModule(Protocol):
    def compute_kpis(self, twin_state) -> Dict[str, Any]:
        ...
    def apply_simulation_rules(self, sim_state, day: int, params: dict) -> None:
        ...
    def annotate_insight_context(self, snapshot: dict) -> dict:
        ...
```

**Modules:**
- `ecommerce`: Inventory, demand forecasting, pricing
- `restaurant`: Table turnover, staff scheduling, ingredient planning
- `agency`: Resource allocation, project profitability
- `clinic`: Appointment optimization, patient flow
- `logistics`: Route optimization, fleet management
- `saas`: Churn prediction, MRR forecasting

## 7. API Design

### 7.1 Authentication
- JWT tokens with `tenant_id` claim
- OAuth2 for external integrations

### 7.2 Core Endpoints

**Business Twin**
- `GET /api/twin/state` - Get current twin state
- `GET /api/twin/kpis` - Get KPIs

**Forecasts**
- `GET /api/forecasts?series=revenue&horizon=30`

**Scenarios**
- `POST /api/scenarios` - Create scenario
- `GET /api/scenarios/:id` - Get scenario result

**Insights**
- `GET /api/insights?type=risk` - Get insights
- `POST /api/insights/generate` - Generate new insights

**Data Sources**
- `GET /api/data-sources` - List connections
- `POST /api/data-sources` - Add connection

## 8. Deployment

### 8.1 Infrastructure
- **Cloud**: AWS / GCP
- **Container Orchestration**: Kubernetes (EKS/GKE)
- **Service Mesh**: Istio (optional)
- **CI/CD**: GitHub Actions

### 8.2 Services Deployment
- Each service runs in its own pod
- Autoscaling based on CPU/memory
- Health checks on `/health` endpoint

### 8.3 Databases
- **PostgreSQL**: RDS / Cloud SQL
- **Neo4j**: Self-managed on EC2/GCE or Aura
- **Redis**: ElastiCache / Memorystore

## 9. Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Logs**: ELK stack / CloudWatch
- **Tracing**: OpenTelemetry
- **Error Tracking**: Sentry
- **Uptime**: 99.9% SLA

## 10. Security

- **Encryption**: At rest (DB) and in transit (TLS)
- **Authentication**: JWT, OAuth2
- **Authorization**: RBAC
- **Compliance**: SOC 2 alignment
- **Secrets**: AWS Secrets Manager / GCP Secret Manager

## 11. Performance Targets

- **Dashboard Load**: < 2s
- **Forecast Generation**: < 10s
- **Simulation Execution**: < 10s
- **API Response Time**: p95 < 500ms
- **Forecast Accuracy**: ≥ 85%
