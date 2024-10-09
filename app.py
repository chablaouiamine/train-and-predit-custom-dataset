from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
import joblib
import os

app = Flask(__name__, static_folder='frontend/dist', static_url_path='/')
CORS(app)

# Global variables to store data and models
data = None
models = {}

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    global data
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and file.filename.endswith('.csv'):
        try:
            data = pd.read_csv(file, delimiter=';')
            columns = data.columns.tolist()
            print(f"Columns found: {columns}")  # Debug print
            return jsonify({'columns': columns}), 200
        except Exception as e:
            print(f"Error reading CSV: {str(e)}")  # Debug print
            return jsonify({'error': 'Error reading CSV file'}), 500
    return jsonify({'error': 'Invalid file format'}), 400


@app.route('/api/train', methods=['POST'])
def train_models():
    global data, models
    if data is None:
        return jsonify({'error': 'No data uploaded'}), 400

    target_variable = request.json.get('target_variable')
    
    # Check if target variable is valid
    if target_variable not in data.columns:
        return jsonify({'error': 'Invalid target variable'}), 400

    try:
        # Prepare the dataset
        X = data.drop(target_variable, axis=1)
        y = data[target_variable]

        # Check if any columns are non-numeric and perform one-hot encoding
        X = pd.get_dummies(X)  # This will one-hot encode categorical variables
        print(f"Data after one-hot encoding: {X.columns.tolist()}")  # Debugging print

        # Split the data into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train models
        models['random_forest'] = RandomForestClassifier(n_estimators=100, random_state=42)
        models['gradient_boosting'] = GradientBoostingClassifier(n_estimators=100, random_state=42)
        models['svm'] = SVC(kernel='rbf', random_state=42)

        for name, model in models.items():
            print(f"Training {name}...")  # Debug print
            model.fit(X_train, y_train)
            print(f"{name} trained successfully")  # Debug print

        # Save models
        if not os.path.exists('models'):
            os.makedirs('models')
        
        for name, model in models.items():
            joblib.dump(model, f'models/{name}.joblib')
            print(f"Model {name} saved successfully")  # Debug print

        # Save feature names
        joblib.dump(X.columns.tolist(), 'models/feature_names.joblib')
        print("Feature names saved successfully")  # Debug print

        return jsonify({'prediction_url': '/predict'}), 200
    except Exception as e:
        # Catch any exception and log it
        print(f"Error during model training: {str(e)}")  # Log the error in the backend console
        return jsonify({'error': 'An error occurred during model training'}), 500

@app.route('/api/features', methods=['GET'])
def get_features():
    try:
        # Load the feature names saved during model training
        feature_names = joblib.load('models/feature_names.joblib')
        return jsonify({'features': feature_names}), 200
    except Exception as e:
        print(f"Error loading features: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching features'}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Load the saved model (you can use any of the trained models)
        model = joblib.load('models/random_forest.joblib')

        # Load the feature names to ensure we match the input correctly
        feature_names = joblib.load('models/feature_names.joblib')

        # Get input values from the request
        input_data = request.json
        input_values = [input_data.get(feature) for feature in feature_names]

        # Convert the input values to a DataFrame (required by the model)
        input_df = pd.DataFrame([input_values], columns=feature_names)

        # Make a prediction
        prediction = model.predict(input_df)

        return jsonify({'prediction': prediction[0]}), 200
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({'error': 'An error occurred during prediction'}), 500


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=os.environ.get('PORT', 5000))