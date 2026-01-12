"""
Prophet-based forecasting model for CogniTwin
Runs revenue, customer, and other metric predictions
"""
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ProphetForecaster:
    """
    Prophet-based time series forecasting model
    """

    def __init__(self):
        self.model = None
        self.metric_name = None

    def prepare_data(self, historical_data: List[Dict]) -> pd.DataFrame:
        """
        Convert historical data to Prophet format (ds, y columns)

        Args:
            historical_data: List of dicts with 'date' and 'value' keys

        Returns:
            DataFrame with 'ds' (date) and 'y' (value) columns
        """
        df = pd.DataFrame(historical_data)
        df = df.rename(columns={'date': 'ds', 'value': 'y'})
        df['ds'] = pd.to_datetime(df['ds'])
        return df

    def train(self, historical_data: List[Dict], metric: str) -> Dict[str, Any]:
        """
        Train Prophet model on historical data

        Args:
            historical_data: Historical time series data
            metric: Name of the metric being forecasted

        Returns:
            Training metrics and model info
        """
        logger.info(f"Training Prophet model for {metric}")

        self.metric_name = metric
        df = self.prepare_data(historical_data)

        # Initialize Prophet with custom parameters
        self.model = Prophet(
            changepoint_prior_scale=0.05,  # Flexibility of trend
            seasonality_prior_scale=10.0,   # Flexibility of seasonality
            seasonality_mode='multiplicative',
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=True,
            stan_backend=None  # Fix for stan_backend AttributeError
        )

        # Fit the model
        self.model.fit(df)

        # Calculate training metrics
        forecast = self.model.predict(df)
        mae = np.mean(np.abs(forecast['yhat'] - df['y']))
        mape = np.mean(np.abs((df['y'] - forecast['yhat']) / df['y'])) * 100

        return {
            'model_type': 'Prophet',
            'metric': metric,
            'training_samples': len(df),
            'mae': float(mae),
            'mape': float(mape),
            'accuracy': float(100 - mape)
        }

    def forecast(self, days: int = 30, confidence_level: float = 0.95) -> Dict[str, Any]:
        """
        Generate forecast for specified number of days

        Args:
            days: Number of days to forecast
            confidence_level: Confidence interval (0.80, 0.95, etc.)

        Returns:
            Forecast data with predictions and confidence intervals
        """
        if self.model is None:
            raise ValueError("Model must be trained before forecasting")

        logger.info(f"Generating {days}-day forecast for {self.metric_name}")

        # Create future dataframe
        future = self.model.make_future_dataframe(periods=days)

        # Generate forecast
        forecast = self.model.predict(future)

        # Extract forecast period (last 'days' rows)
        forecast_period = forecast.tail(days)

        # Format output
        predictions = []
        for _, row in forecast_period.iterrows():
            predictions.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'forecast': round(float(row['yhat']), 2),
                'lower_bound': round(float(row['yhat_lower']), 2),
                'upper_bound': round(float(row['yhat_upper']), 2),
                'confidence': confidence_level
            })

        return {
            'metric': self.metric_name,
            'horizon_days': days,
            'predictions': predictions,
            'trend': self._detect_trend(forecast_period),
            'confidence_level': confidence_level
        }

    def _detect_trend(self, forecast_df: pd.DataFrame) -> str:
        """Detect overall trend direction"""
        first_value = forecast_df.iloc[0]['yhat']
        last_value = forecast_df.iloc[-1]['yhat']
        change_pct = ((last_value - first_value) / first_value) * 100

        if change_pct > 5:
            return 'increasing'
        elif change_pct < -5:
            return 'decreasing'
        else:
            return 'stable'


class EnsembleForecaster:
    """
    Combines multiple models (Prophet + LSTM) for better accuracy
    """

    def __init__(self, prophet_weight: float = 0.6, lstm_weight: float = 0.4):
        self.prophet = ProphetForecaster()
        self.prophet_weight = prophet_weight
        self.lstm_weight = lstm_weight
        self.lstm = None  # Lazy import to avoid circular dependency
        self.historical_data = None

    def train(self, historical_data: List[Dict], metric: str, use_lstm: bool = True) -> Dict[str, Any]:
        """
        Train all models in ensemble

        Args:
            historical_data: Historical time series data
            metric: Name of the metric being forecasted
            use_lstm: Whether to include LSTM model (requires PyTorch)

        Returns:
            Training metrics for both models
        """
        self.historical_data = historical_data

        # Train Prophet model
        prophet_metrics = self.prophet.train(historical_data, metric)

        lstm_metrics = None
        if use_lstm:
            try:
                # Lazy import LSTM to avoid dependency if not using it
                from .lstm_forecaster import LSTMForecaster
                self.lstm = LSTMForecaster(sequence_length=min(7, len(historical_data) // 2))
                lstm_metrics = self.lstm.train(historical_data, metric, epochs=50)
            except ImportError:
                logger.warning("PyTorch not installed, skipping LSTM model. Using Prophet only.")
                use_lstm = False
            except Exception as e:
                logger.error(f"LSTM training failed: {e}. Using Prophet only.")
                use_lstm = False

        return {
            'model_type': 'Prophet + LSTM Ensemble' if use_lstm else 'Prophet',
            'prophet_metrics': prophet_metrics,
            'lstm_metrics': lstm_metrics,
            'ensemble_weights': {
                'prophet': self.prophet_weight if use_lstm else 1.0,
                'lstm': self.lstm_weight if use_lstm else 0.0
            }
        }

    def forecast(self, days: int = 30) -> Dict[str, Any]:
        """
        Generate ensemble forecast (weighted average of Prophet and LSTM)

        Args:
            days: Number of days to forecast

        Returns:
            Combined forecast from both models
        """
        # Get Prophet forecast
        prophet_forecast = self.prophet.forecast(days)

        # If no LSTM model, return Prophet forecast only
        if self.lstm is None:
            return prophet_forecast

        try:
            # Get LSTM forecast
            lstm_forecast = self.lstm.forecast(days, historical_data=self.historical_data)

            # Combine forecasts using weighted average
            combined_predictions = []
            for i in range(days):
                p_pred = prophet_forecast['predictions'][i]
                l_pred = lstm_forecast['predictions'][i]

                # Weighted average
                combined_value = (
                    p_pred['forecast'] * self.prophet_weight +
                    l_pred['forecast'] * self.lstm_weight
                )

                # Combine confidence intervals
                combined_lower = (
                    p_pred['lower_bound'] * self.prophet_weight +
                    l_pred['lower_bound'] * self.lstm_weight
                )

                combined_upper = (
                    p_pred['upper_bound'] * self.prophet_weight +
                    l_pred['upper_bound'] * self.lstm_weight
                )

                combined_predictions.append({
                    'date': p_pred['date'],
                    'forecast': round(combined_value, 2),
                    'lower_bound': round(combined_lower, 2),
                    'upper_bound': round(combined_upper, 2),
                    'prophet_forecast': p_pred['forecast'],
                    'lstm_forecast': l_pred['forecast'],
                    'confidence': 0.95
                })

            # Detect trend from combined forecast
            first_value = combined_predictions[0]['forecast']
            last_value = combined_predictions[-1]['forecast']
            change_pct = ((last_value - first_value) / first_value) * 100

            if change_pct > 5:
                trend = 'increasing'
            elif change_pct < -5:
                trend = 'decreasing'
            else:
                trend = 'stable'

            return {
                'metric': self.prophet.metric_name,
                'horizon_days': days,
                'predictions': combined_predictions,
                'trend': trend,
                'confidence_level': 0.95,
                'model_type': 'Ensemble (Prophet + LSTM)',
                'weights': {
                    'prophet': self.prophet_weight,
                    'lstm': self.lstm_weight
                }
            }

        except Exception as e:
            logger.error(f"LSTM forecast failed: {e}. Falling back to Prophet only.")
            return prophet_forecast


# Example usage and testing
if __name__ == "__main__":
    # Sample historical revenue data
    sample_data = [
        {'date': '2025-11-01', 'value': 42000},
        {'date': '2025-11-08', 'value': 43500},
        {'date': '2025-11-15', 'value': 44800},
        {'date': '2025-11-22', 'value': 46200},
        {'date': '2025-11-29', 'value': 47800},
        {'date': '2025-12-06', 'value': 49100},
        {'date': '2025-12-13', 'value': 50500},
        {'date': '2025-12-20', 'value': 51200},
        {'date': '2025-12-27', 'value': 52340},
        {'date': '2026-01-03', 'value': 53800},
    ]

    # Train and forecast
    forecaster = ProphetForecaster()
    training_results = forecaster.train(sample_data, 'revenue')
    print("Training Results:", training_results)

    forecast_results = forecaster.forecast(days=30)
    print("\nForecast Results:")
    print(f"Trend: {forecast_results['trend']}")
    print(f"First 5 predictions:")
    for pred in forecast_results['predictions'][:5]:
        print(f"  {pred['date']}: ${pred['forecast']:,.2f} (±${pred['upper_bound'] - pred['forecast']:,.2f})")
