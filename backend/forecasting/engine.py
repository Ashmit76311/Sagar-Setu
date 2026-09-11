"""
Sagar Setu — ML Forecasting Engine
Implements SARIMA, Prophet, and XGBoost ensemble model.
"""

import pandas as pd
import numpy as np
from datetime import timedelta
import warnings

# Suppress statsmodels/prophet warnings for clean logs
warnings.filterwarnings("ignore")

try:
    from statsmodels.tsa.statespace.sarimax import SARIMAX
    from prophet import Prophet
    import xgboost as xgb
    from sklearn.metrics import mean_absolute_percentage_error
except ImportError:
    print("Warning: ML libraries not installed. Run pip install -r requirements.txt")

class FreightForecaster:
    def __init__(self, df_history: pd.DataFrame):
        """
        df_history must have columns: ['date', 'rate_usd_per_ton']
        and be sorted by date.
        """
        self.df = df_history.copy()
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df.set_index('date', inplace=True)
        # Ensure daily frequency by filling missing dates (forward fill)
        self.df = self.df.resample('D').ffill()
        
    def _train_sarima(self, horizon_days: int):
        """Train SARIMA and predict."""
        # A simple SARIMA(1,1,1)(0,0,0,0) for speed, can be tuned
        model = SARIMAX(self.df['rate_usd_per_ton'], order=(1, 1, 1))
        results = model.fit(disp=False)
        forecast = results.get_forecast(steps=horizon_days)
        mean_forecast = forecast.predicted_mean.values
        conf_int = forecast.conf_int(alpha=0.2) # 80% confidence
        return mean_forecast, conf_int.iloc[:, 0].values, conf_int.iloc[:, 1].values
        
    def _train_prophet(self, horizon_days: int):
        """Train Prophet and predict."""
        df_prophet = self.df.reset_index().rename(columns={'date': 'ds', 'rate_usd_per_ton': 'y'})
        model = Prophet(daily_seasonality=False, yearly_seasonality=True, weekly_seasonality=False)
        model.fit(df_prophet)
        
        future = model.make_future_dataframe(periods=horizon_days)
        forecast = model.predict(future)
        
        # Get only the future predictions
        future_forecast = forecast.tail(horizon_days)
        return future_forecast['yhat'].values, future_forecast['yhat_lower'].values, future_forecast['yhat_upper'].values

    def _train_xgboost(self, horizon_days: int):
        """Train XGBoost and predict. Uses lag features."""
        df_xgb = self.df.copy()
        # Create lag features
        for i in [1, 7, 14, 30]:
            df_xgb[f'lag_{i}'] = df_xgb['rate_usd_per_ton'].shift(i)
            
        df_xgb['dayofyear'] = df_xgb.index.dayofyear
        df_xgb.dropna(inplace=True)
        
        X = df_xgb.drop('rate_usd_per_ton', axis=1)
        y = df_xgb['rate_usd_per_ton']
        
        model = xgb.XGBRegressor(n_estimators=100, max_depth=3, learning_rate=0.1)
        model.fit(X, y)
        
        # Predict future step-by-step to use own predictions as lags
        predictions = []
        last_known_data = df_xgb.iloc[-1].copy()
        last_date = df_xgb.index[-1]
        
        # We need a small hack to simulate auto-regressive forecasting for horizon
        # For a hackathon, we will just use a simplified XGBoost that predicts directly based on dayofyear 
        # and last known lags (treating them as static for simplicity, or decaying)
        current_lags = last_known_data.copy()
        
        for i in range(1, horizon_days + 1):
            next_date = last_date + timedelta(days=i)
            features = pd.DataFrame({
                'lag_1': [current_lags['rate_usd_per_ton'] if i == 1 else predictions[-1]],
                'lag_7': [current_lags['lag_7']], # simplified
                'lag_14': [current_lags['lag_14']],
                'lag_30': [current_lags['lag_30']],
                'dayofyear': [next_date.dayofyear]
            })
            pred = model.predict(features)[0]
            predictions.append(pred)
            
        preds = np.array(predictions)
        # Approximate confidence intervals for XGB (standard deviation heuristic)
        std_dev = np.std(y) * 0.1
        return preds, preds - std_dev, preds + std_dev

    def ensemble_forecast(self, horizon_days: int):
        """Combines SARIMA, Prophet, and XGBoost forecasts."""
        sarima_mean, sarima_lower, sarima_upper = self._train_sarima(horizon_days)
        prophet_mean, prophet_lower, prophet_upper = self._train_prophet(horizon_days)
        xgb_mean, xgb_lower, xgb_upper = self._train_xgboost(horizon_days)
        
        # Simple average ensemble
        ensemble_mean = (sarima_mean + prophet_mean + xgb_mean) / 3
        ensemble_lower = (sarima_lower + prophet_lower + xgb_lower) / 3
        ensemble_upper = (sarima_upper + prophet_upper + xgb_upper) / 3
        
        # Generate dates
        last_date = self.df.index[-1]
        dates = [last_date + timedelta(days=i) for i in range(1, horizon_days + 1)]
        
        return [
            {
                "forecast_date": d.date(),
                "predicted_rate": float(m),
                "confidence_lower": float(l),
                "confidence_upper": float(u)
            }
            for d, m, l, u in zip(dates, ensemble_mean, ensemble_lower, ensemble_upper)
        ]
        
    def backtest(self, split_ratio=0.8):
        """Calculates MAPE on a holdout set."""
        split_idx = int(len(self.df) * split_ratio)
        train_df = self.df.iloc[:split_idx]
        test_df = self.df.iloc[split_idx:]
        
        # We'll just backtest with Prophet for speed in the demo
        df_prophet = train_df.reset_index().rename(columns={'date': 'ds', 'rate_usd_per_ton': 'y'})
        model = Prophet(daily_seasonality=False, yearly_seasonality=True)
        model.fit(df_prophet)
        
        future = model.make_future_dataframe(periods=len(test_df))
        forecast = model.predict(future)
        predictions = forecast['yhat'].tail(len(test_df)).values
        actuals = test_df['rate_usd_per_ton'].values
        
        mape = mean_absolute_percentage_error(actuals, predictions)
        return mape
