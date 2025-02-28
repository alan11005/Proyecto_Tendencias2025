import os
import pandas as pd
import joblib
from flask import jsonify, send_file
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor, AdaBoostClassifier, AdaBoostRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error

# Opcional: Si se quiere usar XGBoost, se debe tener instalada la librería
try:
    from xgboost import XGBClassifier, XGBRegressor
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

DATA_PATH = '../Back/models'

# Diccionarios que mapean el nombre del algoritmo con la clase correspondiente para clasificación y regresión
CLASSIFICATION_MODELS = {
    "LogisticRegression": LogisticRegression,
    "RandomForest": RandomForestClassifier,
    "SVC": SVC,
    "KNeighbors": KNeighborsClassifier,
    "DecisionTree": DecisionTreeClassifier,
    "GradientBoosting": GradientBoostingClassifier,
    "AdaBoost": AdaBoostClassifier,
    "MLP": MLPClassifier
}

REGRESSION_MODELS = {
    "LinearRegression": LinearRegression,
    "RandomForest": RandomForestRegressor,
    "SVR": SVR,
    "KNeighbors": KNeighborsRegressor,
    "DecisionTree": DecisionTreeRegressor,
    "GradientBoosting": GradientBoostingRegressor,
    "AdaBoost": AdaBoostRegressor,
    "MLP": MLPRegressor
}

# Agregar modelos de XGBoost si están disponibles
if XGB_AVAILABLE:
    CLASSIFICATION_MODELS["XGBClassifier"] = XGBClassifier
    REGRESSION_MODELS["XGBRegressor"] = XGBRegressor

def upload_dataset(file):
    try:
        df = pd.DataFrame(file)
        # Se podría guardar temporalmente el dataset para usarlo en el entrenamiento
        df.to_csv("../Back/uploaded_dataset/dataset.csv", index=False)
        return jsonify({"columns": df.columns.tolist(), "message": "Dataset cargado correctamente"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

def select_target(task_type):
    if task_type == "classification":
        algorithms = list(CLASSIFICATION_MODELS.keys())
    elif task_type == "regression":
        algorithms = list(REGRESSION_MODELS.keys())
    else:
        return jsonify({"error": "Tipo de tarea no reconocido"}), 400
    return jsonify({"algorithms": algorithms})

def train_models(target_column, task_type, selected_algorithms):
    try:
        # Se asume que el dataset ya fue cargado y guardado en "dataset.csv"
        df = pd.read_csv("../Back/uploaded_dataset/dataset.csv")
    except Exception as e:
        return jsonify({"error": "Dataset no encontrado. Primero cargar el dataset."}), 400

    if target_column not in df.columns:
        return jsonify({"error": "La columna objetivo no existe en el dataset"}), 400

    X = df.drop(columns=[target_column])
    y = df[target_column]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models_info = {}

    # Seleccionar el diccionario de modelos en función del tipo de tarea
    if task_type == "classification":
        available_models = CLASSIFICATION_MODELS
        scoring = accuracy_score
    elif task_type == "regression":
        available_models = REGRESSION_MODELS
        scoring = lambda y_true, y_pred: -mean_squared_error(y_true, y_pred)  # Usamos negativo para maximizar
    else:
        return jsonify({"error": "Tipo de tarea no válido"}), 400

    for algo in selected_algorithms:
        if algo not in available_models:
            continue

        ModelClass = available_models[algo]
        # params = hyperparameters.get(algo, {})  # Permite configurar hiperparámetros específicos
        model = ModelClass()
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        score = scoring(y_test, y_pred)

        model_id = f"{algo}_{len(os.listdir(DATA_PATH))}.pkl"
        joblib.dump(model, os.path.join(DATA_PATH, model_id))
        models_info[algo] = {"id": model_id, "score": score}

    # Seleccionar el mejor modelo según la métrica (para regresión, score es negativo MSE)
    best_model = max(models_info, key=lambda x: models_info[x]["score"])
    return jsonify({"models": models_info, "best_model": best_model})

def get_metrics(model_id):
    try:
        model = joblib.load(os.path.join(DATA_PATH, model_id))
    except Exception as e:
        return jsonify({"error": "Modelo no encontrado"}), 400
    # Aquí se pueden implementar métricas específicas según el tipo de modelo
    # Por ejemplo, si es de clasificación se podría calcular una matriz de confusión o similar
    # Se muestra un ejemplo genérico:
    return jsonify({"metrics": {"score": "Métrica de ejemplo"}})

def predict(model_id, data):
    try:
        model = joblib.load(os.path.join(DATA_PATH, model_id))
    except Exception as e:
        return jsonify({"error": "Modelo no encontrado"}), 400

    features = data.get("features")
    if features is None:
        return jsonify({"error": "No se proporcionaron los datos de entrada"}), 400

    prediction = model.predict([features])
    return jsonify({"prediction": prediction.tolist()})

def download_model(model_id):
    path = os.path.join(DATA_PATH, model_id)
    if not os.path.exists(path):
        return jsonify({"error": "Modelo no encontrado"}), 400
    return send_file(path, as_attachment=True)