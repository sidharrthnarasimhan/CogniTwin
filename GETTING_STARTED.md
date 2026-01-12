# Getting Started with CogniTwin

## Quick Start

### 1. Prerequisites

Ensure you have installed:
- **Node.js** 18+ & npm 9+
- **Python** 3.11+
- **Docker** & Docker Compose
- **Git**

### 2. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/sidharrthnarasimhan/CogniTwin.git
cd CogniTwin

# Start infrastructure services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

### 3. Initialize Database

```bash
# Run database migrations
docker exec -i cognitwin-postgres-1 psql -U cognitwin -d cognitwin < database/schemas/01_core_schema.sql

# Verify tables were created
docker exec -it cognitwin-postgres-1 psql -U cognitwin -d cognitwin -c "\dt"
```

### 4. Service Development

Each service can be developed independently:

```bash
# API Gateway
cd backend/api-gateway
npm install
npm run dev

# Forecasting Service (Python)
cd backend/services/forecasting
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Project Structure Explained

```
CogniTwin/
├── backend/                      # All backend services
│   ├── api-gateway/              # Main API gateway (Node.js/TypeScript)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── services/                 # Microservices
│   │   ├── business-twin/        # Digital twin state management
│   │   ├── scenario/             # Scenario/simulation orchestration
│   │   ├── insight/              # Insight generation API
│   │   ├── forecasting/          # ML forecasting (Python/FastAPI)
│   │   ├── simulation-engine/    # Simulation execution (Python)
│   │   ├── ingestion/            # Data ingestion orchestrator
│   │   └── schema-normalizer/    # Raw → canonical normalization
│   │
│   ├── connectors/               # External integrations
│   │   ├── shopify/              # Shopify OAuth + webhooks
│   │   ├── stripe/               # Stripe webhooks
│   │   ├── quickbooks/           # QuickBooks integration
│   │   └── common/               # Shared connector utilities
│   │
│   ├── industry-modules/         # Industry-specific business logic
│   │   ├── ecommerce/            # E-commerce KPIs, rules
│   │   ├── restaurant/           # Restaurant operations
│   │   ├── agency/               # Agency/services
│   │   ├── clinic/               # Healthcare/clinic
│   │   ├── logistics/            # Logistics/supply chain
│   │   ├── saas/                 # SaaS metrics
│   │   └── core/                 # Core module interface
│   │
│   ├── llm-council/              # AI Council system
│   │   ├── orchestrator/         # Coordinates all agents
│   │   └── agents/               # Individual AI agents
│   │       ├── analyst/          # Data analysis agent
│   │       ├── operator/         # Operational insights
│   │       ├── strategist/       # Strategic planning
│   │       ├── risk-officer/     # Risk assessment
│   │       ├── industry-expert/  # Industry-specific knowledge
│   │       └── synthesizer/      # Aggregates all perspectives
│   │
│   └── shared/                   # Shared libraries
│       ├── types/                # TypeScript types
│       ├── utils/                # Utility functions
│       ├── db/                   # Database clients
│       └── queue/                # Queue/messaging clients
│
├── infrastructure/               # Deployment & infrastructure
│   ├── terraform/                # Infrastructure as Code
│   ├── kubernetes/               # K8s manifests
│   ├── docker/                   # Dockerfiles
│   └── scripts/                  # Deployment scripts
│
├── database/                     # Database files
│   ├── migrations/               # SQL migrations (versioned)
│   ├── seeds/                    # Test/demo data
│   └── schemas/                  # Schema documentation
│
├── frontend/                     # Frontend applications
│   ├── web/                      # Next.js web app
│   └── shared/                   # Shared UI components
│
├── docs/                         # Documentation
│   ├── architecture/             # Technical architecture
│   ├── api/                      # API specs
│   └── guides/                   # How-to guides
│
├── config/                       # Configuration files
├── scripts/                      # Utility scripts
└── tests/                        # Tests
    ├── integration/              # Integration tests
    └── e2e/                      # End-to-end tests
```

## Key Services & Ports

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| API Gateway | Node.js/Express | 3000 | Main API entry point |
| Business Twin | Node.js | 3001 | Digital twin state |
| Scenario Service | Node.js | 3002 | Simulation requests |
| Insight Service | Node.js | 3003 | AI insights API |
| Forecasting | Python/FastAPI | 8001 | ML forecasting |
| Simulation Engine | Python/FastAPI | 8002 | Simulation execution |
| PostgreSQL | - | 5432 | Canonical data |
| Redis | - | 6379 | Cache & features |
| Neo4j | - | 7474/7687 | Graph twin (optional) |
| Kafka | - | 9092 | Event streaming |
| MinIO | - | 9000 | S3-compatible storage |

## Development Workflow

### 1. Create a New Service

```bash
# Example: Create a new connector
mkdir -p backend/connectors/my-connector
cd backend/connectors/my-connector
npm init -y
npm install express axios
```

### 2. Add Industry Module

Industry modules implement standardized interfaces:

```python
# backend/industry-modules/my-industry/module.py
from typing import Dict, Any

class MyIndustryModule:
    def compute_kpis(self, twin_state: Dict) -> Dict[str, Any]:
        # Calculate industry-specific KPIs
        return {"custom_metric": 123}

    def apply_simulation_rules(self, sim_state: Dict, day: int, params: dict):
        # Apply industry rules during simulation
        pass

    def annotate_insight_context(self, snapshot: dict) -> dict:
        # Add industry context for LLM Council
        return {**snapshot, "industry_notes": "..."}
```

### 3. Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Environment Variables

Create `.env` files in each service directory:

```bash
# backend/api-gateway/.env
PORT=3000
DATABASE_URL=postgresql://cognitwin:dev_password@localhost:5432/cognitwin
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## Common Tasks

### Run Database Migrations

```bash
# Create new migration
cd database/migrations
# Edit new SQL file

# Apply migration
docker exec -i cognitwin-postgres-1 psql -U cognitwin -d cognitwin < migrations/002_add_new_table.sql
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Reset Development Environment

```bash
# Stop all services
docker-compose down -v

# Remove all data
docker volume prune

# Restart fresh
docker-compose up -d
```

## Next Steps

1. **Read the [Technical Spec](./docs/architecture/TECHNICAL_SPEC.md)** for detailed architecture
2. **Explore the [API Documentation](./docs/api/README.md)** for endpoint details
3. **Check [Industry Modules](./backend/industry-modules/README.md)** to add your industry
4. **Review [LLM Council](./backend/llm-council/README.md)** for AI insights implementation

## Support

- **Issues**: https://github.com/sidharrthnarasimhan/CogniTwin/issues
- **Discussions**: https://github.com/sidharrthnarasimhan/CogniTwin/discussions
- **Email**: dev@cognitwin.com
