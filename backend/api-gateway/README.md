# CogniTwin API Gateway

The API Gateway is the central entry point for all client requests to the CogniTwin platform. It handles authentication, authorization, rate limiting, and routes requests to appropriate microservices.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Request Routing**: Proxies requests to backend microservices
- **Rate Limiting**: Prevents API abuse
- **Request Logging**: Structured logging for all requests
- **Error Handling**: Centralized error handling with proper status codes
- **Security**: Helmet for security headers, CORS configuration

## Architecture

```
Client → API Gateway → Microservices
         (Auth, Rate Limit, Logging)
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (for user authentication)
- Redis (for rate limiting)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for signing JWT tokens
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout

### Digital Twin
- `GET /api/twin/state` - Get twin state
- `GET /api/twin/metrics` - Get twin metrics
- `POST /api/twin/sync` - Trigger sync

### Forecasts
- `GET /api/forecasts` - Get all forecasts
- `GET /api/forecasts/:metric` - Get specific forecast
- `POST /api/forecasts/generate` - Generate new forecast

### Scenarios
- `GET /api/scenarios` - Get all scenarios
- `GET /api/scenarios/:id` - Get specific scenario
- `POST /api/scenarios` - Create new scenario
- `DELETE /api/scenarios/:id` - Delete scenario

### Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/:id` - Get specific insight
- `POST /api/insights/generate` - Generate insights
- `POST /api/insights/:id/feedback` - Submit feedback

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To obtain a token, use the `/api/auth/login` endpoint.

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
api-gateway/
├── src/
│   ├── index.ts              # Main application entry
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # Authentication & authorization
│   │   ├── errorHandler.ts # Error handling
│   │   └── requestLogger.ts# Request logging
│   ├── routes/              # API routes
│   │   ├── auth.ts          # Authentication routes
│   │   ├── twin.ts          # Digital twin routes
│   │   ├── forecasts.ts     # Forecast routes
│   │   ├── scenarios.ts     # Scenario routes
│   │   └── insights.ts      # Insight routes
│   └── utils/               # Utilities
│       └── logger.ts        # Winston logger config
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## License

Proprietary - Copyright © 2026 CogniTwin
