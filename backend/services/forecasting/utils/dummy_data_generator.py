"""
Dummy Data Generator for Testing CogniTwin
Generates realistic business metrics without requiring real data
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import math

class DummyDataGenerator:
    """
    Generates realistic dummy data for testing forecasting and AI council
    """

    # Predefined business profiles
    BUSINESS_PROFILES = {
        'startup_saas': {
            'revenue': {'base': 10000, 'growth_rate': 0.08, 'volatility': 0.15},
            'customers': {'base': 150, 'growth_rate': 0.06, 'volatility': 0.10},
            'churn_rate': {'base': 5.5, 'growth_rate': -0.02, 'volatility': 0.20},
            'mrr': {'base': 8500, 'growth_rate': 0.07, 'volatility': 0.12}
        },
        'ecommerce': {
            'revenue': {'base': 250000, 'growth_rate': 0.04, 'volatility': 0.25},
            'customers': {'base': 5000, 'growth_rate': 0.03, 'volatility': 0.15},
            'orders': {'base': 1200, 'growth_rate': 0.035, 'volatility': 0.20},
            'avg_order_value': {'base': 85, 'growth_rate': 0.01, 'volatility': 0.08}
        },
        'enterprise_b2b': {
            'revenue': {'base': 500000, 'growth_rate': 0.03, 'volatility': 0.10},
            'customers': {'base': 45, 'growth_rate': 0.02, 'volatility': 0.15},
            'pipeline_value': {'base': 1200000, 'growth_rate': 0.04, 'volatility': 0.18},
            'deal_size': {'base': 85000, 'growth_rate': 0.025, 'volatility': 0.12}
        },
        'restaurant': {
            'revenue': {'base': 45000, 'growth_rate': 0.02, 'volatility': 0.20},
            'customers': {'base': 850, 'growth_rate': 0.01, 'volatility': 0.18},
            'avg_check': {'base': 42, 'growth_rate': 0.015, 'volatility': 0.10},
            'table_turns': {'base': 3.2, 'growth_rate': 0.005, 'volatility': 0.12}
        },
        'agency': {
            'revenue': {'base': 120000, 'growth_rate': 0.05, 'volatility': 0.15},
            'clients': {'base': 25, 'growth_rate': 0.03, 'volatility': 0.20},
            'project_value': {'base': 15000, 'growth_rate': 0.04, 'volatility': 0.18},
            'utilization_rate': {'base': 75, 'growth_rate': 0.01, 'volatility': 0.08}
        }
    }

    def __init__(self, profile: str = 'startup_saas'):
        """
        Initialize generator with a business profile

        Args:
            profile: One of the predefined business profiles
        """
        if profile not in self.BUSINESS_PROFILES:
            raise ValueError(f"Profile must be one of: {list(self.BUSINESS_PROFILES.keys())}")

        self.profile = profile
        self.config = self.BUSINESS_PROFILES[profile]

    def generate_metric_data(
        self,
        metric: str,
        days_back: int = 90,
        end_date: Optional[datetime] = None,
        seasonality: bool = True,
        trend_change: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Generate realistic time series data for a specific metric

        Args:
            metric: Metric name (must exist in profile)
            days_back: Number of historical days to generate
            end_date: End date for the series (default: today)
            seasonality: Whether to add weekly/monthly seasonality
            trend_change: Whether to add a mid-period trend shift

        Returns:
            List of data points with date and value
        """
        if metric not in self.config:
            raise ValueError(f"Metric '{metric}' not found in profile '{self.profile}'")

        params = self.config[metric]
        base_value = params['base']
        growth_rate = params['growth_rate']  # Daily growth rate
        volatility = params['volatility']

        if end_date is None:
            end_date = datetime.now()

        data = []

        for i in range(days_back):
            # Calculate date (going backward from end_date)
            current_date = end_date - timedelta(days=(days_back - i - 1))

            # Base trend (exponential growth/decay)
            trend_multiplier = (1 + growth_rate) ** i
            trend_value = base_value * trend_multiplier

            # Add seasonality
            if seasonality:
                # Weekly seasonality (weekend dip for B2B, spike for B2C)
                day_of_week = current_date.weekday()
                if self.profile in ['startup_saas', 'enterprise_b2b', 'agency']:
                    # B2B: Lower on weekends
                    weekly_factor = 1.0 - (0.15 if day_of_week >= 5 else 0)
                else:
                    # B2C: Higher on weekends
                    weekly_factor = 1.0 + (0.20 if day_of_week >= 5 else 0)

                # Monthly seasonality (end-of-month spike)
                day_of_month = current_date.day
                monthly_factor = 1.0 + (0.15 if day_of_month >= 25 else 0)

                seasonal_multiplier = (weekly_factor + monthly_factor) / 2
            else:
                seasonal_multiplier = 1.0

            # Add trend change at midpoint (simulates strategy change, new product, etc.)
            if trend_change and i >= days_back // 2:
                trend_boost = 1.15  # 15% boost after midpoint
            else:
                trend_boost = 1.0

            # Calculate value with noise
            noise = random.uniform(-volatility, volatility)
            value = trend_value * seasonal_multiplier * trend_boost * (1 + noise)

            # Ensure non-negative values
            value = max(value, base_value * 0.1)

            data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'value': round(value, 2)
            })

        return data

    def generate_all_metrics(
        self,
        days_back: int = 90,
        **kwargs
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generate data for all metrics in the profile

        Returns:
            Dictionary mapping metric names to data arrays
        """
        result = {}
        for metric in self.config.keys():
            result[metric] = self.generate_metric_data(metric, days_back, **kwargs)

        return result

    def generate_scenario_assumptions(
        self,
        scenario_type: str = 'optimistic'
    ) -> Dict[str, float]:
        """
        Generate realistic scenario assumptions for testing

        Args:
            scenario_type: 'optimistic', 'pessimistic', or 'realistic'

        Returns:
            Dictionary of assumption parameters
        """
        scenarios = {
            'optimistic': {
                'price_increase': 0.20,
                'customer_acquisition_boost': 0.35,
                'churn_reduction': 0.25,
                'conversion_rate_improvement': 0.40,
                'expansion_revenue_increase': 0.50
            },
            'pessimistic': {
                'price_increase': -0.10,
                'customer_acquisition_boost': -0.20,
                'churn_increase': 0.30,
                'conversion_rate_decrease': -0.25,
                'market_contraction': -0.15
            },
            'realistic': {
                'price_increase': 0.10,
                'customer_acquisition_boost': 0.15,
                'churn_reduction': 0.10,
                'conversion_rate_improvement': 0.12,
                'expansion_revenue_increase': 0.18
            },
            'aggressive_growth': {
                'price_increase': 0.25,
                'customer_acquisition_boost': 0.50,
                'marketing_spend_increase': 0.60,
                'sales_team_expansion': 0.40,
                'product_launch_impact': 0.30
            },
            'cost_cutting': {
                'price_increase': 0.05,
                'customer_acquisition_reduction': -0.30,
                'operational_efficiency': 0.20,
                'headcount_reduction': -0.15,
                'vendor_renegotiation': 0.10
            }
        }

        return scenarios.get(scenario_type, scenarios['realistic'])


# Convenience functions for quick testing

def get_sample_revenue_data(profile: str = 'startup_saas', days: int = 90) -> List[Dict]:
    """Quick function to get sample revenue data"""
    generator = DummyDataGenerator(profile)
    return generator.generate_metric_data('revenue', days_back=days)

def get_sample_business_data(profile: str = 'startup_saas', days: int = 90) -> Dict:
    """Quick function to get all business metrics"""
    generator = DummyDataGenerator(profile)
    return generator.generate_all_metrics(days_back=days)

def get_test_scenario(scenario_type: str = 'realistic') -> Dict:
    """Quick function to get scenario assumptions"""
    generator = DummyDataGenerator()
    return generator.generate_scenario_assumptions(scenario_type)


# Example usage and testing
if __name__ == "__main__":
    print("🎲 Dummy Data Generator Examples\n")

    # Example 1: Generate SaaS startup revenue data
    print("1. SaaS Startup - Revenue (90 days)")
    generator = DummyDataGenerator('startup_saas')
    revenue_data = generator.generate_metric_data('revenue', days_back=90)
    print(f"   Generated {len(revenue_data)} data points")
    print(f"   First: {revenue_data[0]}")
    print(f"   Last: {revenue_data[-1]}")
    print()

    # Example 2: Generate all metrics for e-commerce
    print("2. E-commerce - All Metrics")
    ecom_generator = DummyDataGenerator('ecommerce')
    all_data = ecom_generator.generate_all_metrics(days_back=30)
    for metric, data in all_data.items():
        avg_value = sum(d['value'] for d in data) / len(data)
        print(f"   {metric}: {len(data)} days, avg = {avg_value:,.2f}")
    print()

    # Example 3: Test scenarios
    print("3. Test Scenarios")
    for scenario in ['optimistic', 'realistic', 'pessimistic', 'aggressive_growth']:
        assumptions = get_test_scenario(scenario)
        print(f"   {scenario}:")
        for key, value in list(assumptions.items())[:3]:
            print(f"      {key}: {value:+.1%}")
    print()

    # Example 4: Available profiles
    print("4. Available Business Profiles:")
    for profile in DummyDataGenerator.BUSINESS_PROFILES.keys():
        gen = DummyDataGenerator(profile)
        metrics = list(gen.config.keys())
        print(f"   - {profile}: {', '.join(metrics)}")
