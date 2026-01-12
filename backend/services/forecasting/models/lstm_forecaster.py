"""
LSTM-based forecasting model for CogniTwin
Deep learning time series prediction using PyTorch
"""
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class LSTMNetwork(nn.Module):
    """
    LSTM Neural Network for time series forecasting
    """
    def __init__(self, input_size: int = 1, hidden_size: int = 50, num_layers: int = 2, output_size: int = 1):
        super(LSTMNetwork, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # Initialize hidden state and cell state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))

        # Decode the hidden state of the last time step
        out = self.fc(out[:, -1, :])
        return out


class LSTMForecaster:
    """
    LSTM-based time series forecasting model
    """

    def __init__(self, sequence_length: int = 10, hidden_size: int = 50, num_layers: int = 2):
        self.sequence_length = sequence_length
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.metric_name = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def prepare_sequences(self, data: np.ndarray) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Create sequences for LSTM training

        Args:
            data: 1D array of values

        Returns:
            X: Input sequences (batch_size, sequence_length, 1)
            y: Target values (batch_size, 1)
        """
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(data[i + self.sequence_length])

        X = np.array(X).reshape(-1, self.sequence_length, 1)
        y = np.array(y).reshape(-1, 1)

        return torch.FloatTensor(X).to(self.device), torch.FloatTensor(y).to(self.device)

    def train(self, historical_data: List[Dict], metric: str, epochs: int = 100, lr: float = 0.001) -> Dict[str, Any]:
        """
        Train LSTM model on historical data

        Args:
            historical_data: List of dicts with 'date' and 'value' keys
            metric: Name of metric being forecasted
            epochs: Number of training epochs
            lr: Learning rate

        Returns:
            Training metrics and model info
        """
        logger.info(f"Training LSTM model for {metric}")

        self.metric_name = metric

        # Extract values and normalize
        df = pd.DataFrame(historical_data)
        values = df['value'].values.reshape(-1, 1)
        scaled_values = self.scaler.fit_transform(values)

        # Create sequences
        X_train, y_train = self.prepare_sequences(scaled_values.flatten())

        # Initialize model
        self.model = LSTMNetwork(
            input_size=1,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers,
            output_size=1
        ).to(self.device)

        # Training setup
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)

        # Training loop
        self.model.train()
        losses = []
        for epoch in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(X_train)
            loss = criterion(outputs, y_train)
            loss.backward()
            optimizer.step()
            losses.append(loss.item())

            if (epoch + 1) % 20 == 0:
                logger.info(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.6f}")

        # Calculate training metrics
        self.model.eval()
        with torch.no_grad():
            predictions = self.model(X_train)
            final_loss = criterion(predictions, y_train).item()

            # Inverse transform for actual metrics
            pred_actual = self.scaler.inverse_transform(predictions.cpu().numpy())
            y_actual = self.scaler.inverse_transform(y_train.cpu().numpy())

            mae = np.mean(np.abs(pred_actual - y_actual))
            mape = np.mean(np.abs((y_actual - pred_actual) / y_actual)) * 100

        return {
            'model_type': 'LSTM',
            'metric': metric,
            'training_samples': len(X_train),
            'epochs': epochs,
            'final_loss': float(final_loss),
            'mae': float(mae),
            'mape': float(mape),
            'accuracy': float(100 - mape)
        }

    def forecast(self, days: int = 30, historical_data: List[Dict] = None) -> Dict[str, Any]:
        """
        Generate forecast for specified number of days

        Args:
            days: Number of days to forecast
            historical_data: Recent historical data to seed predictions

        Returns:
            Forecast data with predictions
        """
        if self.model is None:
            raise ValueError("Model must be trained before forecasting")

        logger.info(f"Generating {days}-day LSTM forecast for {self.metric_name}")

        # Use last sequence_length values to start predictions
        df = pd.DataFrame(historical_data)
        values = df['value'].values[-self.sequence_length:].reshape(-1, 1)
        scaled_values = self.scaler.transform(values)

        # Generate predictions iteratively
        self.model.eval()
        predictions = []
        current_sequence = scaled_values.flatten().tolist()

        with torch.no_grad():
            for i in range(days):
                # Prepare input sequence
                X = np.array(current_sequence[-self.sequence_length:]).reshape(1, self.sequence_length, 1)
                X_tensor = torch.FloatTensor(X).to(self.device)

                # Predict next value
                pred = self.model(X_tensor).cpu().numpy()[0, 0]

                # Add to sequence for next prediction
                current_sequence.append(pred)
                predictions.append(pred)

        # Inverse transform predictions to original scale
        predictions = np.array(predictions).reshape(-1, 1)
        predictions_actual = self.scaler.inverse_transform(predictions)

        # Format output
        forecast_data = []
        from datetime import datetime, timedelta
        start_date = datetime.strptime(df.iloc[-1]['date'], '%Y-%m-%d')

        for i, pred in enumerate(predictions_actual):
            forecast_date = start_date + timedelta(days=i + 1)

            # Calculate simple confidence intervals (±10%)
            pred_value = float(pred[0])
            margin = pred_value * 0.10

            forecast_data.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'forecast': round(pred_value, 2),
                'lower_bound': round(pred_value - margin, 2),
                'upper_bound': round(pred_value + margin, 2)
            })

        return {
            'metric': self.metric_name,
            'horizon_days': days,
            'predictions': forecast_data,
            'trend': self._detect_trend(predictions_actual),
            'model': 'LSTM'
        }

    def _detect_trend(self, predictions: np.ndarray) -> str:
        """Detect overall trend direction"""
        first_value = predictions[0, 0]
        last_value = predictions[-1, 0]
        change_pct = ((last_value - first_value) / first_value) * 100

        if change_pct > 5:
            return 'increasing'
        elif change_pct < -5:
            return 'decreasing'
        else:
            return 'stable'


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
        {'date': '2026-01-10', 'value': 55200},
    ]

    # Train and forecast
    forecaster = LSTMForecaster(sequence_length=7)
    training_results = forecaster.train(sample_data, 'revenue', epochs=100)
    print("Training Results:", training_results)

    forecast_results = forecaster.forecast(days=30, historical_data=sample_data)
    print("\nForecast Results:")
    print(f"Trend: {forecast_results['trend']}")
    print(f"First 5 predictions:")
    for pred in forecast_results['predictions'][:5]:
        print(f"  {pred['date']}: ${pred['forecast']:,.2f} (${pred['lower_bound']:,.2f} - ${pred['upper_bound']:,.2f})")
