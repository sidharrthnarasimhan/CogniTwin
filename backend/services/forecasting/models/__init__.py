"""
CogniTwin Forecasting Models Package
"""
from .prophet_forecaster import ProphetForecaster, EnsembleForecaster

try:
    from .lstm_forecaster import LSTMForecaster
    LSTM_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    LSTMForecaster = None

__all__ = ['ProphetForecaster', 'EnsembleForecaster', 'LSTMForecaster', 'LSTM_AVAILABLE']
