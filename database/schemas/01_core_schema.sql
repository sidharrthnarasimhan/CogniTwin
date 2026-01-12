-- CogniTwin Core Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- TENANTS & CONFIGURATION
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, starter, pro, enterprise
    industry VARCHAR(50), -- ecommerce, restaurant, saas, etc.
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, churned
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================
-- DATA SOURCES & INTEGRATIONS
-- ============================================

CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- shopify, stripe, quickbooks, etc.
    name VARCHAR(255),
    config_json JSONB NOT NULL DEFAULT '{}', -- OAuth tokens, API keys (encrypted)
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, error, disconnected
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_minutes INT DEFAULT 60,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_sources_tenant ON data_sources(tenant_id);
CREATE INDEX idx_data_sources_type ON data_sources(type);
CREATE INDEX idx_data_sources_status ON data_sources(status);

-- ============================================
-- CANONICAL BUSINESS ENTITIES
-- ============================================

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_ids JSONB DEFAULT '{}', -- {shopify: "123", stripe: "cus_abc"}
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    segment VARCHAR(50), -- new, returning, vip, churned
    lifetime_value NUMERIC(12, 2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    first_order_at TIMESTAMP WITH TIME ZONE,
    last_order_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_external_ids ON customers USING gin(external_ids);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_ids JSONB DEFAULT '{}',
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cost NUMERIC(10, 2),
    price NUMERIC(10, 2),
    inventory_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_external_ids ON products USING gin(external_ids);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    external_ids JSONB DEFAULT '{}',
    order_number VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- pending, processing, completed, cancelled, refunded
    total_amount NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2),
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    shipping_amount NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50), -- pending, paid, failed, refunded
    fulfillment_status VARCHAR(50), -- unfulfilled, partial, fulfilled
    channel VARCHAR(50), -- online, pos, marketplace
    ordered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at DESC);
CREATE INDEX idx_orders_external_ids ON orders USING gin(external_ids);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    cost NUMERIC(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Transactions (Payments)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    external_ids JSONB DEFAULT '{}',
    payment_provider VARCHAR(50), -- stripe, paypal, square
    transaction_type VARCHAR(50), -- charge, refund, payout
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- pending, completed, failed, refunded
    payment_method VARCHAR(50), -- card, bank_transfer, cash
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_paid_at ON transactions(paid_at DESC);

-- Staff
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    external_ids JSONB DEFAULT '{}',
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(100),
    location_id UUID, -- Can reference locations table if needed
    employment_type VARCHAR(50), -- full_time, part_time, contractor
    cost_per_hour NUMERIC(8, 2),
    weekly_hours INT DEFAULT 40,
    hire_date DATE,
    termination_date DATE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_tenant ON staff(tenant_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- Events (Generic event log)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- page_view, click, booking, etc.
    entity_type VARCHAR(50), -- order, customer, product
    entity_id UUID,
    user_id UUID, -- customer or staff
    payload JSONB DEFAULT '{}',
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred_at ON events(occurred_at DESC);
CREATE INDEX idx_events_payload ON events USING gin(payload);

-- ============================================
-- AGGREGATED METRICS (Feature Store)
-- ============================================

CREATE TABLE daily_metrics (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    revenue NUMERIC(12, 2) DEFAULT 0,
    order_count INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    returning_customers INT DEFAULT 0,
    average_order_value NUMERIC(10, 2) DEFAULT 0,
    units_sold INT DEFAULT 0,
    refund_amount NUMERIC(12, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, date)
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

-- ============================================
-- FORECASTS
-- ============================================

CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    series_type VARCHAR(50) NOT NULL, -- revenue, demand, churn, etc.
    forecast_date DATE NOT NULL,
    horizon_days INT NOT NULL, -- days into future from generation date
    predicted_value NUMERIC(12, 2),
    lower_bound NUMERIC(12, 2),
    upper_bound NUMERIC(12, 2),
    confidence NUMERIC(5, 4), -- 0.95 for 95%
    model_type VARCHAR(50), -- prophet, lstm, etc.
    model_version VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, series_type, forecast_date)
);

CREATE INDEX idx_forecasts_tenant_series ON forecasts(tenant_id, series_type);
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date);

-- ============================================
-- SCENARIOS (Simulations)
-- ============================================

CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}', -- {price_change: 0.05, extra_staff: 2}
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    result JSONB DEFAULT '{}', -- KPI deltas, charts data
    execution_time_ms INT,
    created_by UUID, -- user_id
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_scenarios_tenant ON scenarios(tenant_id);
CREATE INDEX idx_scenarios_status ON scenarios(status);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);

-- ============================================
-- INSIGHTS (LLM Council Output)
-- ============================================

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- summary, risk, opportunity, recommendation
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence NUMERIC(5, 4), -- 0.0 to 1.0
    impact VARCHAR(20), -- low, medium, high
    priority INT DEFAULT 0,
    tags TEXT[], -- {revenue, churn, operations}
    source_agents TEXT[], -- {analyst, strategist, risk_officer}
    payload JSONB DEFAULT '{}', -- full council output
    valid_until TIMESTAMP WITH TIME ZONE,
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insights_tenant ON insights(tenant_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_generated_at ON insights(generated_at DESC);
CREATE INDEX idx_insights_tags ON insights USING gin(tags);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL, -- create, update, delete, login
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
