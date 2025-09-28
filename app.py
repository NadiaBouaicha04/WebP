import dash
from dash import dcc, html, Input, Output, State
import plotly.express as px
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import cross_val_score, KFold
import base64
import io

# Load and prepare data
df = pd.read_excel("Full Combined Cleaned Data.xlsx")
df.dropna(subset=['Category'], inplace=True)
df.drop_duplicates(inplace=True)

# Handle zero or negative prices
df = df[df['Price (TND)'] > 0]  # Remove rows where Price (TND) <= 0
df['Price_log'] = np.log(df['Price (TND)'])

# Check for any remaining NaN or infinite values
if df['Price_log'].isna().any() or np.isinf(df['Price_log']).any():
    raise ValueError("Price_log contains NaN or infinite values after transformation")

# Preprocess data
categorical_cols = ['Category', 'Governorate', 'Area', 'Source']
df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
X = df_encoded.drop(['Price (TND)', 'Price_log'], axis=1)
y = df_encoded['Price_log']

# Ensure no NaN or infinite values in X
if X.isna().any().any() or np.isinf(X).any().any():
    raise ValueError("Features contain NaN or infinite values")

# Train the best XGBoost model
xgb_params = {
    'subsample': 0.7,
    'reg_lambda': 1,
    'reg_alpha': 0,
    'n_estimators': 400,
    'max_depth': 3,
    'learning_rate': 0.05,
    'gamma': 1,
    'colsample_bytree': 1.0,
    'random_state': 42,
    'verbosity': 0
}
xgb = XGBRegressor(**xgb_params)
xgb.fit(X, y)  # Train on full data for deployment

# Get unique values for dropdowns
unique_categories = df['Category'].unique().tolist()
unique_governorates = df['Governorate'].unique().tolist()
unique_areas = df['Area'].unique().tolist()
unique_sources = df['Source'].unique().tolist()

# Initialize Dash app
app = dash.Dash(__name__)

# Layout
app.layout = html.Div([
    html.H1("Tunisia Real Estate Price Predictor"),
    
    html.Div([
        html.Label("Category:"),
        dcc.Dropdown(
            id='category-dropdown',
            options=[{'label': cat, 'value': cat} for cat in unique_categories],
            value=unique_categories[0]
        ),
        
        html.Label("Governorate:"),
        dcc.Dropdown(
            id='governorate-dropdown',
            options=[{'label': gov, 'value': gov} for gov in unique_governorates],
            value=unique_governorates[0]
        ),
        
        html.Label("Area:"),
        dcc.Dropdown(
            id='area-dropdown',
            options=[{'label': area, 'value': area} for area in unique_areas],
            value=unique_areas[0]
        ),
        
        html.Label("Source:"),
        dcc.Dropdown(
            id='source-dropdown',
            options=[{'label': src, 'value': src} for src in unique_sources],
            value=unique_sources[0]
        ),
        
        html.Label("Rooms:"),
        dcc.Input(id='rooms-input', type='number', value=3, min=1),
        
        html.Label("Area (m²):"),
        dcc.Input(id='area-m2-input', type='number', value=150, min=1),
        
        html.Button('Predict Price', id='predict-button', n_clicks=0),
        
        html.Div(id='prediction-output', style={'margin-top': '20px', 'font-size': '24px'})
    ], style={'width': '30%', 'float': 'left', 'padding': '20px'}),
    
    html.Div([
        dcc.Graph(id='price-distribution'),
        dcc.Graph(id='feature-importance')
    ], style={'width': '70%', 'float': 'right'})
])

# Callback for prediction
@app.callback(
    Output('prediction-output', 'children'),
    Input('predict-button', 'n_clicks'),
    State('category-dropdown', 'value'),
    State('governorate-dropdown', 'value'),
    State('area-dropdown', 'value'),
    State('source-dropdown', 'value'),
    State('rooms-input', 'value'),
    State('area-m2-input', 'value')
)
def predict_price(n_clicks, category, governorate, area, source, rooms, area_m2):
    if n_clicks > 0:
        if rooms is None or area_m2 is None or rooms <= 0 or area_m2 <= 0:
            return "Please enter valid values for Rooms and Area (m²)"
        
        # Create input dataframe
        input_df = pd.DataFrame({
            'Rooms': [rooms],
            'Area (m²)': [area_m2],
            'Category': [category],
            'Governorate': [governorate],
            'Area': [area],
            'Source': [source]
        })
        
        # Encode input to match training data
        input_encoded = pd.get_dummies(input_df, columns=categorical_cols, drop_first=True)
        input_encoded = input_encoded.reindex(columns=X.columns, fill_value=0)
        
        # Predict log price and convert back
        log_pred = xgb.predict(input_encoded)[0]
        pred_price = np.exp(log_pred)
        
        return f"Predicted Price: {pred_price:,.2f} TND"
    return ""

# Callback for price distribution plot
@app.callback(
    Output('price-distribution', 'figure'),
    Input('governorate-dropdown', 'value')
)
def update_price_dist(governorate):
    filtered_df = df[df['Governorate'] == governorate]
    fig = px.histogram(filtered_df, x='Price (TND)', color='Category', title=f'Price Distribution in {governorate}')
    return fig

# Callback for feature importance plot
@app.callback(
    Output('feature-importance', 'figure'),
    Input('predict-button', 'n_clicks')
)
def update_feature_importance(n_clicks):
    importances = xgb.feature_importances_
    feature_names = X.columns
    imp_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    imp_df = imp_df.sort_values('Importance', ascending=False).head(10)
    fig = px.bar(imp_df, x='Importance', y='Feature', orientation='h', title='Top 10 Feature Importances')
    return fig

# Run the app
if __name__ == '__main__':
    app.run(debug=True)