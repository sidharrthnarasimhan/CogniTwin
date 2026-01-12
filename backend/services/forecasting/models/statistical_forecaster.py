"""
Simple statistical forecasting model for CogniTwin
Uses trend analysis and seasonality decomposition
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class StatisticalForecaster:
    """
    Statistical time series forecasting using trend + seasonality decomposition
    This is a simplified, reliable alternative to Prophet
    """

    def __init__(self):
        self.metric_name = None
        self.trend_slope = 0
        self.trend_intercept = 0
        self.seasonality = {}
        self.mean_value = 0
        self.std_value = 0
        self.last_date = None

    def prepare_data(self, historical_data: List[Dict]) -> pd.DataFrame:
        """
        Convert historical data to DataFrame with date index

        Args:
            historical_data: List of dicts with 'date' and 'value' keys

        Returns:
            DataFrame with date index and values
        """
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date').sort_index()
        return df

    def train(self, historical_data: List[Dict], metric: str) -> Dict[str, Any]:
        """
        Train statistical model on historical data

        Args:
            historical_data: Historical time series data
            metric: Name of the metric being forecasted

        Returns:
            Training metrics and model info
        """
        logger.info(f"Training Statistical model for {metric}")

        self.metric_name = metric
        df = self.prepare_data(historical_data)

        # Calculate basic statistics
        self.mean_value = df['value'].mean()
        self.std_value = df['value'].std()
        self.last_date = df.index[-1]

        # Fit linear trend
        days_elapsed = np.arange(len(df))
        self.trend_slope, self.trend_intercept = np.polyfit(days_elapsed, df['value'].values, 1)

        # Calculate day-of-week seasonality
        df['dayofweek'] = df.index.dayofweek
        weekly_avg = df.groupby('dayofweek')['value'].mean()
        overall_mean = df['value'].mean()
        self.seasonality = {dow: (val / overall_mean) for dow, val in weekly_avg.items()}

        # Calculate training accuracy
        predictions = []
        for i, (idx, row) in enumerate(df.iterrows()):
            day_trend = self.trend_intercept + (self.trend_slope * i)
            dow = idx.dayofweek
            seasonal_mult = self.seasonality.get(dow, 1.0)
            pred = day_trend * seasonal_mult
            predictions.append(pred)

        predictions = np.array(predictions)
        actual = df['value'].values

        mae = np.mean(np.abs(predictions - actual))
        mape = np.mean(np.abs((actual - predictions) / actual)) * 100
        accuracy = max(0, 100 - mape)

        return {
            'model_type': 'Statistical (Trend + Seasonality)',
            'metric': metric,
            'training_samples': len(df),
            'trend_slope': float(self.trend_slope),
            'mae': float(mae),
            'mape': float(mape),
            'accuracy': float(accuracy)
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
        if self.last_date is None:
            raise ValueError("Model must be trained before forecasting")

        logger.info(f"Generating {days}-day forecast for {self.metric_name}")

        # Calculate z-score for confidence level
        z_scores = {0.80: 1.28, 0.90: 1.645, 0.95: 1.96, 0.99: 2.576}
        z = z_scores.get(confidence_level, 1.96)

        predictions = []
        current_date = self.last_date + timedelta(days=1)
        base_day = len(pd.date_range(start=self.last_date - timedelta(days=90), end=self.last_date))

        for i in range(days):
            forecast_date = current_date + timedelta(days=i)
            day_num = base_day + i

            # Trend component
            trend_value = self.trend_intercept + (self.trend_slope * day_num)

            # Seasonality component
            dow = forecast_date.dayofweek
            seasonal_mult = self.seasonality.get(dow, 1.0)

            # Combine trend and seasonality
            forecast_value = trend_value * seasonal_mult

            # Calculate confidence intervals
            # Uncertainty increases with forecast horizon
            uncertainty = self.std_value * z * (1 + (i / days) * 0.3)
            lower_bound = forecast_value - uncertainty
            upper_bound = forecast_value + uncertainty

            predictions.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'forecast': round(float(forecast_value), 2),
                'lower_bound': round(float(lower_bound), 2),
                'upper_bound': round(float(upper_bound), 2),
                'confidence': confidence_level
            })

        # Detect trend
        first_value = predictions[0]['forecast']
        last_value = predictions[-1]['forecast']
        change_pct = ((last_value - first_value) / first_value) * 100

        if change_pct > 5:
            trend = 'increasing'
        elif change_pct < -5:
            trend = 'decreasing'
        else:
            trend = 'stable'

        return {
            'metric': self.metric_name,
            'model_type': 'Statistical',
            'horizon_days': days,
            'predictions': predictions,
            'trend': trend,
            'confidence_level': confidence_level
        }


class EnsembleForecaster:
    """
    Combines Statistical + LSTM for better accuracy
    """

    def __init__(self, statistical_weight: float = 0.6, lstm_weight: float = 0.4):
        self.statistical = StatisticalForecaster()
        self.statistical_weight = statistical_weight
        self.lstm_weight = lstm_weight
        self.lstm = None
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

        # Train Statistical model
        statistical_metrics = self.statistical.train(historical_data, metric)

        lstm_metrics = None
        if use_lstm:
            try:
                # Lazy import LSTM to avoid dependency if not using it
                from .lstm_forecaster import LSTMForecaster
                self.lstm = LSTMForecaster(sequence_length=min(7, len(historical_data) // 2))
                lstm_metrics = self.lstm.train(historical_data, metric, epochs=50)
            except ImportError:
                logger.warning("PyTorch not installed, skipping LSTM model. Using Statistical only.")
                use_lstm = False
            except Exception as e:
                logger.error(f"LSTM training failed: {e}. Using Statistical only.")
                use_lstm = False

        return {
            'model_type': 'Statistical + LSTM Ensemble' if use_lstm else 'Statistical',
            'statistical_metrics': statistical_metrics,
            'lstm_metrics': lstm_metrics,
            'ensemble_weights': {
                'statistical': self.statistical_weight if use_lstm else 1.0,
                'lstm': self.lstm_weight if use_lstm else 0.0
            }
        }

    def forecast(self, days: int = 30) -> Dict[str, Any]:
        """
        Generate ensemble forecast (weighted average of Statistical and LSTM)

        Args:
            days: Number of days to forecast

        Returns:
            Combined forecast from both models
        """
        # Get Statistical forecast
        statistical_forecast = self.statistical.forecast(days)

        # If no LSTM model, return Statistical forecast only
        if self.lstm is None:
            return statistical_forecast

        try:
            # Get LSTM forecast
            lstm_forecast = self.lstm.forecast(days, historical_data=self.historical_data)

            # Combine forecasts using weighted average
            combined_predictions = []
            for i in range(days):
                s_pred = statistical_forecast['predictions'][i]
                l_pred = lstm_forecast['predictions'][i]

                # Weighted average
                combined_value = (
                    s_pred['forecast'] * self.statistical_weight +
                    l_pred['forecast'] * self.lstm_weight
                )

                # Combine confidence intervals
                combined_lower = (
                    s_pred['lower_bound'] * self.statistical_weight +
                    l_pred['lower_bound'] * self.lstm_weight
                )

                combined_upper = (
                    s_pred['upper_bound'] * self.statistical_weight +
                    l_pred['upper_bound'] * self.lstm_weight
                )

                combined_predictions.append({
                    'date': s_pred['date'],
                    'forecast': round(combined_value, 2),
                    'lower_bound': round(combined_lower, 2),
                    'upper_bound': round(combined_upper, 2),
                    'statistical_forecast': s_pred['forecast'],
                    'lstm_forecast': l_pred['forecast'],
                    'confidence': 0.95
                })

            # Detect trend
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
                'metric': self.statistical.metric_name,
                'model_type': 'Ensemble (Statistical + LSTM)',
                'horizon_days': days,
                'predictions': combined_predictions,
                'trend': trend,
                'confidence_level': 0.95,
                'weights': {
                    'statistical': self.statistical_weight,
                    'lstm': self.lstm_weight
                }
            }

        except Exception as e:
            logger.error(f"LSTM forecast failed: {e}. Falling back to Statistical only.")
            return statistical_forecast
