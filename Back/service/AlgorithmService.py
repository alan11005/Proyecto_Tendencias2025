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
# Metricas para regresion
from sklearn.metrics import mean_squared_error, accuracy_score, r2_score, mean_absolute_error, median_absolute_error
# Metricas para clasificacion
from sklearn.metrics import confusion_matrix, roc_auc_score, roc_curve, precision_recall_curve, f1_score, recall_score, precision_score, accuracy_score

# Opcional: Si se quiere usar XGBoost, se debe tener instalada la librería
try:
    from xgboost import XGBClassifier, XGBRegressor
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

DATA_PATH = '../Back/models'
SPLIT_DATA_PATH = '../Back/dataset_utils/split_data'

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
        df.to_csv("../Back/dataset_utils/dataset/dataset.csv", index=False)
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
        df = pd.read_csv("../Back/dataset_utils/dataset/dataset.csv")
    except Exception as e:
        return jsonify({"error": "Dataset no encontrado. Primero cargar el dataset."}), 400

    if target_column not in df.columns:
        return jsonify({"error": "La columna objetivo no existe en el dataset"}), 400

    X = df.drop(columns=[target_column])
    y = df[target_column]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    joblib.dump(X_train, os.path.join(SPLIT_DATA_PATH, "X_train.pkl"))
    joblib.dump(X_test, os.path.join(SPLIT_DATA_PATH, "X_test.pkl"))
    joblib.dump(y_train, os.path.join(SPLIT_DATA_PATH, "y_train.pkl"))
    joblib.dump(y_test, os.path.join(SPLIT_DATA_PATH, "y_test.pkl"))

    models_info = {}

    # Seleccionar el diccionario de modelos en función del tipo de tarea
    if task_type == "classification":
        available_models = CLASSIFICATION_MODELS
        scoring = accuracy_score
    elif task_type == "regression":
        available_models = REGRESSION_MODELS
        scoring = mean_squared_error  
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

def get_metrics(model_id, task_type):
    try:
        model = joblib.load(os.path.join(DATA_PATH, model_id))
    except Exception as e:
        return jsonify({"error": "Modelo no encontrado"}), 400

    try:
        X_train = joblib.load(os.path.join(SPLIT_DATA_PATH, 'X_train.pkl'))
        X_test = joblib.load(os.path.join(SPLIT_DATA_PATH, 'X_test.pkl'))
        y_train = joblib.load(os.path.join(SPLIT_DATA_PATH, 'y_train.pkl'))
        y_test = joblib.load(os.path.join(SPLIT_DATA_PATH, 'y_test.pkl'))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    if task_type == "classification":
        train_accuracy = accuracy_score(y_train, y_train_pred)
        train_recall = recall_score(y_train, y_train_pred)
        train_precision = precision_score(y_train, y_train_pred)
        train_f1 = f1_score(y_train, y_train_pred)
        train_roc_auc = roc_auc_score(y_train, y_train_pred)
        train_confussion_matrix = confusion_matrix(y_train, y_train_pred).tolist()
        return jsonify({
            "metrics_train": {
                "accuracy": train_accuracy,
                "recall": train_recall,
                "precision": train_precision,
                "f1": train_f1,
                "roc_auc": train_roc_auc,
                "confusion_matrix": train_confussion_matrix
            },
            "metrics_test": {
                "accuracy": accuracy_score(y_test, y_test_pred),
                "recall": recall_score(y_test, y_test_pred),
                "precision": precision_score(y_test, y_test_pred),
                "f1": f1_score(y_test, y_test_pred),
                "roc_auc": roc_auc_score(y_test, y_test_pred),
                "confusion_matrix": confusion_matrix(y_test, y_test_pred).tolist()
            }
        })
    elif task_type == "regression":
        train_score = mean_squared_error(y_train, y_train_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        train_mae = mean_absolute_error(y_train, y_train_pred)
        train_medae = median_absolute_error(y_train, y_train_pred)
        return jsonify({
            "metrics_train": {
                "mse": train_score,
                "r2": train_r2,
                "mae": train_mae,
                "medae": train_medae
            },
            "metrics_test": {
                "mse": mean_squared_error(y_test, y_test_pred),
                "r2": r2_score(y_test, y_test_pred),
                "mae": mean_absolute_error(y_test, y_test_pred),
                "medae": median_absolute_error(y_test, y_test_pred)
            }
        })
    return jsonify({"metrics": {"score": "Métrica de ejemplo"}})

def predict(model_id, inputs, target):
    try:
        model = joblib.load(os.path.join(DATA_PATH, model_id))
    except Exception as e:
        return jsonify({"error": "Modelo no encontrado"}), 400

    df = pd.read_csv("../Back/dataset_utils/dataset/dataset.csv")
    columns = df.columns.tolist()

    input_values = [inputs[column] for column in columns if column != target]
    prediction = model.predict([input_values])
    return jsonify({"prediction": prediction.tolist()[0]})

def download_model(model_id):
    path = os.path.join(DATA_PATH, model_id)
    if not os.path.exists(path):
        return jsonify({"error": "Modelo no encontrado"}), 400
    return send_file(path, as_attachment=True)