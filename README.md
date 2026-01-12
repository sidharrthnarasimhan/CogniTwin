# CogniTwin - Digital Business Twin Platform

> Multi-industry Digital Business Twin Platform with AI-powered forecasting, simulation, and insights.

## Overview

CogniTwin connects to your operational data and builds a living simulation of your business. It predicts outcomes, simulates decisions, and provides actionable insights through our unique LLM Council multi-agent system.

## Architecture

- **Backend Services**: Microservices architecture (Node.js/TypeScript + Python)
- **Databases**: PostgreSQL (canonical data), Neo4j (graph twin), Redis (feature store)
- **ML/AI**: Prophet, PyTorch (forecasting), Multi-agent LLM Council
- **Infrastructure**: AWS/GCP, Kubernetes, Docker

## Project Structure

```
cognitwin/
├── backend/
│   ├── api-gateway/              # API Gateway (auth, routing, throttling)
│   ├── services/                 # Core microservices
│   │   ├── business-twin/        # Digital twin state management
│   │   ├── scenario/             # Simulation scenario orchestration
│   │   ├── insight/              # Insight generation & retrieval
│   │   ├── forecasting/          # ML forecasting service (Python)
│   │   ├── simulation-engine/    # Simulation execution engine (Python)
│   │   ├── ingestion/            # Data ingestion orchestrator
│   │   └── schema-normalizer/    # Raw → canonical data mapping
│   ├── connectors/               # External system integrations
│   │   ├── shopify/
│   │   ├── stripe/
│   │   ├── quickbooks/
│   │   └── common/
│   ├── industry-modules/         # Industry-specific logic
│   │   ├── ecommerce/
│   │   ├── restaurant/
│   │   ├── agency/
│   │   ├── clinic/
│   │   ├── logistics/
│   │   ├── saas/
│   │   └── core/
│   ├── llm-council/              # Multi-agent AI system
│   │   ├── orchestrator/
│   │   └── agents/
│   │       ├── analyst/
│   │       ├── operator/
│   │       ├── strategist/
│   │       ├── risk-officer/
│   │       ├── industry-expert/
│   │       └── synthesizer/
│   └── shared/                   # Shared libraries
│       ├── types/
│       ├── utils/
│       ├── db/
│       └── queue/
├── infrastructure/
│   ├── terraform/                # IaC for cloud resources
│   ├── kubernetes/               # K8s manifests
│   ├── docker/                   # Dockerfiles
│   └── scripts/                  # Deployment scripts
├── database/
│   ├── migrations/               # SQL migrations
│   ├── seeds/                    # Test data
│   └── schemas/                  # Schema documentation
├── frontend/
│   ├── web/                      # Next.js web application
│   └── shared/                   # Shared components/utils
├── docs/
│   ├── architecture/             # Technical architecture docs
│   ├── api/                      # API documentation
│   └── guides/                   # Setup & usage guides
├── config/                       # Configuration files
├── scripts/                      # Utility scripts
└── tests/
    ├── integration/              # Integration tests
    └── e2e/                      # End-to-end tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Neo4j 5+ (optional, for graph twin)
- Docker & Docker Compose

### Local Development

```bash
# Clone the repository
git clone https://github.com/sidharrthnarasimhan/CogniTwin.git
cd CogniTwin

# Install dependencies
./scripts/install.sh

# Setup databases
./scripts/setup-db.sh

# Start services
docker-compose up -d

# Run migrations
npm run migrate

# Start development servers
npm run dev
```

## Core Features

### 1. Data Ingestion
- Connectors for Shopify, Stripe, QuickBooks, and more
- Real-time webhook processing
- Event-driven architecture

### 2. Digital Twin
- Graph-based business model
- Real-time KPI computation
- Multi-tenant architecture

### 3. Forecasting
- Revenue, demand, churn prediction
- ML-powered (Prophet, PyTorch)
- 85%+ accuracy

### 4. Simulation Engine
- What-if scenario testing
- Industry-specific rules
- <10s execution time

### 5. LLM Council
- Multi-agent AI insights
- 6 specialized agents: Analyst, Operator, Strategist, Risk Officer, Industry Expert, Synthesizer
- Confidence scoring & explainability

### 6. Industry Modules
- E-commerce
- Restaurants
- Agencies
- Clinics
- Logistics
- SaaS

## Technology Stack

### Backend
- **API Gateway**: Node.js, Express, TypeScript
- **Services**: Node.js/TypeScript, Python FastAPI
- **Queue**: Kafka / AWS SQS
- **Cache**: Redis
- **ML**: Prophet, PyTorch, scikit-learn

### Databases
- **PostgreSQL**: Canonical data, metrics
- **Neo4j**: Digital twin graph (optional)
- **Redis/Feast**: Feature store
- **S3/GCS**: Raw data storage

### Frontend
- **Framework**: Next.js 14, React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Query
- **Charts**: Recharts

### Infrastructure
- **Cloud**: AWS / GCP
- **Orchestration**: Kubernetes (EKS/GKE)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana, Sentry

## API Documentation

See [docs/api/README.md](./docs/api/README.md) for full API documentation.

Key endpoints:
- `GET /api/twin/state` - Get digital twin state
- `GET /api/forecasts` - Get forecast data
- `POST /api/scenarios` - Create simulation scenario
- `GET /api/insights` - Get AI-generated insights

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - Copyright © 2026 CogniTwin

## Support

- Email: support@cognitwin.com
- Documentation: https://docs.cognitwin.com
- Issues: https://github.com/sidharrthnarasimhan/CogniTwin/issues
