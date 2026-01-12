"""
Data fetcher utility for historical metrics
In production, this would connect to PostgreSQL/TimescaleDB
For now, generates realistic mock historical data
"""
from datetime import datetime, timedelta
from typing import List, Dict
import random


def generate_historical_data(metric: str, days_back: int = 90) -> List[Dict]:
    """
    Generate realistic historical time series data

    Args:
        metric: Metric name (revenue, customers, orders, churn_rate)
        days_back: Number of days of historical data

    Returns:
        List of dicts with 'date' and 'value' keys
    """
    base_values = {
        'revenue': 45000,
        'customers': 1500,
        'orders': 7800,
        'churn_rate': 0.035,
        'mrr': 45000,
        'arr': 540000,
        'cac': 280,
        'ltv': 3800
    }

    # Growth rates per day
    growth_rates = {
        'revenue': 0.003,  # ~0.3% daily growth = ~12% monthly
        'customers': 0.0025,  # ~0.25% daily
        'orders': 0.0028,
        'churn_rate': -0.0001,  # Slight improvement
        'mrr': 0.003,
        'arr': 0.003,
        'cac': -0.0005,  # Decreasing CAC is good
        'ltv': 0.002
    }

    # Volatility (noise factor)
    volatility = {
        'revenue': 0.08,  # 8% daily variance
        'customers': 0.05,
        'orders': 0.10,
        'churn_rate': 0.15,
        'mrr': 0.06,
        'arr': 0.04,
        'cac': 0.08,
        'ltv': 0.05
    }

    base_value = base_values.get(metric, 1000)
    growth_rate = growth_rates.get(metric, 0.002)
    vol = volatility.get(metric, 0.05)

    historical_data = []
    current_date = datetime.now() - timedelta(days=days_back)

    for i in range(days_back):
        # Calculate trend
        trend_multiplier = 1 + (growth_rate * i)

        # Add noise
        noise = random.uniform(-vol, vol)

        # Weekly seasonality (higher on Mon-Fri, lower on weekends)
        weekday = current_date.weekday()
        seasonality = 1.0
        if weekday >= 5:  # Weekend
            seasonality = 0.85
        elif weekday == 0:  # Monday peak
            seasonality = 1.1

        value = base_value * trend_multiplier * (1 + noise) * seasonality

        # Ensure positive values
        value = max(value, 0)

        # Round based on metric type
        if metric == 'churn_rate':
            value = round(value, 4)
        elif metric in ['customers', 'orders']:
            value = int(value)
        else:
            value = round(value, 2)

        historical_data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'value': value
        })

        current_date += timedelta(days=1)

    return historical_data


def fetch_historical_data_from_db(tenant_id: str, metric: str, days_back: int = 90) -> List[Dict]:
    """
    Fetch historical data from database (PostgreSQL/TimescaleDB)

    In production, this would execute SQL like:
    SELECT date, value
    FROM metrics
    WHERE tenant_id = %s AND metric_name = %s AND date >= NOW() - INTERVAL '%s days'
    ORDER BY date ASC

    Args:
        tenant_id: Tenant identifier
        metric: Metric name
        days_back: Number of days of history

    Returns:
        List of dicts with 'date' and 'value' keys
    """
    # TODO: Implement actual database connection
    # For now, return generated data
    return generate_historical_data(metric, days_back)


def validate_historical_data(data: List[Dict]) -> bool:
    """
    Validate historical data format

    Args:
        data: List of historical data points

    Returns:
        True if valid, False otherwise
    """
    if not data or len(data) < 7:  # Need at least a week of data
        return False

    required_keys = {'date', 'value'}

    for item in data:
        if not all(key in item for key in required_keys):
            return False

        # Validate date format
        try:
            datetime.strptime(item['date'], '%Y-%m-%d')
        except ValueError:
            return False

        # Validate value is numeric
        if not isinstance(item['value'], (int, float)):
            return False

    return True
