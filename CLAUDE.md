# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CogniTwin is a multi-tenant Digital Business Twin Platform that ingests operational data, builds living business simulations, and provides AI-powered forecasting and insights through a multi-agent LLM Council system. The platform supports multiple industries (e-commerce, restaurants, agencies, clinics, logistics, SaaS) with specialized business logic modules.

## Development Commands

### Local Development

```bash
# Start infrastructure services (PostgreSQL, Redis, Neo4j, Kafka)
docker-compose up -d

# Verify services are healthy
docker-compose ps

# Initialize database
docker exec -i cognitwin-postgres-1 psql -U cognitwin -d cognitwin < database/schemas/01_core_schema.sql

# API Gateway (port 3000)
cd backend/api-gateway
npm install
npm run dev

# Forecasting Service - Python ML models (port 8001)
cd backend/services/forecasting
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

# LLM Council Orchestrator - Multi-agent AI system (port 4000)
cd backend/llm-council/orchestrator
npm install
npm run dev

# Frontend - Next.js web app
cd frontend/web
npm install
npm run dev

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down
```

### Testing

```bash
# Run unit tests across workspaces
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Run the demo script (shows all 4 main features)
./demo.sh
```

### Database Operations

```bash
# Apply new migration
docker exec -i cognitwin-postgres-1 psql -U cognitwin -d cognitwin < database/migrations/XXX_migration.sql

# Verify tables
docker exec -it cognitwin-postgres-1 psql -U cognitwin -d cognitwin -c "\dt"
```

## Architecture Overview

### Microservices Architecture

The platform uses an event-driven microservices architecture with the following key services:

1. **API Gateway** (Node.js/TypeScript, port 3000): JWT authentication, routing, rate limiting, request validation
2. **Business Twin Service** (Node.js, port 3001): Digital twin state management using PostgreSQL + Neo4j graph database
3. **Scenario Service** (Node.js, port 3002): Simulation scenario orchestration
4. **Insight Service** (Node.js, port 3003): AI-generated insights API
5. **Forecasting Service** (Python/FastAPI, port 8001): ML forecasting using Prophet, PyTorch, scikit-learn
6. **Simulation Engine** (Python/FastAPI, port 8002): Simulation execution engine
7. **LLM Council Orchestrator** (Node.js/TypeScript, port 4000): Multi-agent AI system coordinator
8. **Ingestion Orchestrator** (Node.js): Data ingestion from external systems via Kafka/SQS
9. **Schema Normalizer** (Node.js): Raw data to canonical schema transformation

### Data Flow

```
External Systems (Shopify/Stripe/QuickBooks)
  → Connectors (webhook handlers)
  → Ingestion Orchestrator (event queue)
  → Raw Data Store (S3/GCS)
  → Schema Normalizer (transformation)
  → Canonical Data DB (PostgreSQL)
  → Digital Twin Graph (Neo4j)
  → Feature Store (Redis/Feast)
  → ML Forecasting + Simulation Engine
  → LLM Council (multi-agent analysis)
  → API Gateway → Frontend
```

### Multi-Tenant Design

All database tables include `tenant_id` for isolation. JWT tokens contain `tenant_id` claims. All API requests require `X-Tenant-ID` header (test value: `tenant_123`).

## Key Technologies

- **Backend**: Node.js 18+, TypeScript, Python 3.11+, Express, FastAPI
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
- **Databases**: PostgreSQL 15+ (canonical data), Neo4j 5+ (graph twin), Redis 7+ (cache/features)
- **ML/AI**: Prophet, PyTorch, scikit-learn, OpenAI API
- **Infrastructure**: Docker, Kubernetes, Kafka/SQS, AWS/GCP
- **Monitoring**: Prometheus, Grafana, Sentry

## LLM Council System

The LLM Council is a multi-agent AI system with 6 specialized agents that analyze business data and provide insights:

1. **Analyst**: Data-driven insights and trend analysis
2. **Operator**: Operational efficiency and execution recommendations
3. **Strategist**: Long-term planning and strategic opportunities
4. **Risk Officer**: Risk assessment and threat identification
5. **Industry Expert**: Domain-specific knowledge for the tenant's industry
6. **Synthesizer**: Aggregates all perspectives into final actionable insights

The council can run in different organizational structures (consensus, hierarchical, democratic, adversarial) configured in `backend/llm-council/orchestrator/src/simulation-engine.ts`.

### Testing LLM Council

```bash
# Basic forecast analysis
curl -X POST http://localhost:4000/council/forecast/analyze \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{"metric":"revenue","horizonDays":30}' | jq

# Agent conversation with debate (shows agent thinking)
curl -X POST "http://localhost:4000/council/simulate/preset?debate=true" \
  -H "X-Tenant-ID: tenant_123" \
  -H "Content-Type: application/json" \
  -d '{"presetId":"balanced_growth","scenarioName":"Test","metric":"revenue","assumptions":{"price_increase":0.15}}' | jq
```

## Industry Modules

Each industry module (located in `backend/industry-modules/`) implements a standardized interface:

```python
class IndustryModule(Protocol):
    def compute_kpis(self, twin_state) -> Dict[str, Any]:
        """Calculate industry-specific KPIs"""

    def apply_simulation_rules(self, sim_state, day: int, params: dict) -> None:
        """Apply industry-specific rules during simulation"""

    def annotate_insight_context(self, snapshot: dict) -> dict:
        """Add industry context for LLM Council"""
```

Supported industries: ecommerce, restaurant, agency, clinic, logistics, saas

## Code Organization

- **backend/api-gateway/**: Main API entry point with auth and routing
- **backend/services/**: Core microservices (business-twin, scenario, insight, forecasting, simulation-engine, ingestion, schema-normalizer)
- **backend/connectors/**: External system integrations (shopify, stripe, quickbooks) with common utilities
- **backend/industry-modules/**: Industry-specific business logic
- **backend/llm-council/**: Multi-agent AI system (orchestrator + 6 agents)
- **backend/shared/**: Shared libraries (types, utils, db clients, queue clients)
- **frontend/web/**: Next.js application
- **database/**: SQL schemas, migrations, seed data
- **infrastructure/**: Terraform, Kubernetes manifests, Dockerfiles
- **docs/**: Architecture documentation, API specs, guides

## Important File Locations

- **ML Models**: `backend/services/forecasting/models/` (Prophet, LSTM implementations)
- **AI Agents**: `backend/llm-council/orchestrator/src/agents/`
- **Simulation Engine**: `backend/llm-council/orchestrator/src/simulation-engine.ts`
- **Agent Conversations**: `backend/llm-council/orchestrator/src/agent-conversation.ts`
- **Database Schema**: `database/schemas/01_core_schema.sql`
- **Docker Compose**: `docker-compose.yml` (infrastructure services)

## API Endpoints

Key endpoints (all require authentication):

- `GET /api/twin/state` - Get digital twin state
- `GET /api/twin/kpis` - Get computed KPIs
- `GET /api/forecasts?series=revenue&horizon=30` - Get forecast data
- `POST /api/scenarios` - Create simulation scenario
- `GET /api/scenarios/:id` - Get scenario results
- `GET /api/insights?type=risk` - Get AI-generated insights
- `POST /api/insights/generate` - Generate new insights
- `GET /api/data-sources` - List connected data sources
- `POST /api/data-sources` - Add new data source connection

## Performance Targets

- Dashboard load: < 2s
- Forecast generation: < 10s
- Simulation execution: < 10s
- API response time: p95 < 500ms
- Forecast accuracy: ≥ 85%

## Additional Documentation

- `GETTING_STARTED.md` - Setup and development workflow
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `AGENT_CONVERSATION_GUIDE.md` - How to view agent thinking and debates
- `SIMULATION_ENGINE_GUIDE.md` - Council configurations and presets
- `ML_FORECASTING_COMPLETE.md` - ML models implementation guide
- `LLM_INTEGRATION_GUIDE.md` - LLM Council integration details
- `QUICK_REFERENCE.md` - Quick commands for seeing AI in action
- `docs/architecture/TECHNICAL_SPEC.md` - Detailed technical architecture
