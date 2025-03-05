import pandas as pd
import joblib
from flask import jsonify
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler, StandardScaler
import numpy as np

DATASET_PATH = "../Back/dataset_utils/dataset/dataset.csv"

def load_dataset():
    try:
        return pd.read_csv(DATASET_PATH)
    except Exception as e:
        return None

def apply_encoding(data):
    df = load_dataset()
    if df is None:
        return jsonify({"error": error}), 400

    columns = data.get("columns")
    encoding_type = data.get("encoding_type", "onehot")

    if not columns or not isinstance(columns, list):
        return jsonify({"error": "Debe especificar un array de columnas para aplicar el encoding"}), 400

    # Verificar que las columnas existan en el dataset
    missing_cols = [col for col in columns if col not in df.columns]
    if missing_cols:
        return jsonify({"error": "Las siguientes columnas no se encontraron en el dataset: " + ", ".join(missing_cols)}), 400

    # Verificar que las columnas sean categóricas (tipo object o con baja cardinalidad)
    invalid_cols = [col for col in columns if not pd.api.types.is_object_dtype(df[col]) and df[col].nunique() > 10]
    if encoding_type == "onehot" and invalid_cols:
        return jsonify({"error": "Las siguientes columnas no son categóricas o tienen demasiados valores únicos para aplicar OneHotEncoding: " + ", ".join(invalid_cols)}), 400

    if encoding_type == "onehot":
        encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        encoded = encoder.fit_transform(df[columns])
        df = df.drop(columns=columns)
        new_columns = encoder.get_feature_names_out(columns)
        df_encoded = pd.DataFrame(encoded, columns=new_columns)
        df = pd.concat([df, df_encoded], axis=1)
    elif encoding_type == "frequency":
        for col in columns:
            df[col] = df[col].map(df[col].value_counts(normalize=True))
    else:
        return jsonify({"error": "Tipo de encoding no soportado. Use 'onehot' o 'frequency'"}), 400

    df.to_csv(DATASET_PATH, index=False)
    return jsonify({"message": f"Encoding '{encoding_type}' aplicado correctamente a las columnas: {', '.join(columns)}"})

def detect_missing_values():
    df = load_dataset()
    if df is None:
        return jsonify({"error": error}), 400

    missing_info = df.isnull().sum().to_dict()
    return jsonify({"missing_values": missing_info})

def apply_scaling(data):
    df = load_dataset()
    if df is None:
        return jsonify({"error": error}), 400

    columns = data.get("columns")
    scaler_type = data.get("scaler_type")

    if not columns or not isinstance(columns, list):
        return jsonify({"error": "Debe especificar un array de columnas para aplicar el escalado"}), 400
    
    if scaler_type not in ["minmax", "standard"]:
        return jsonify({"error": "Tipo de escalado no soportado. Use 'minmax' o 'standard'"}), 400
    
    # Verificar que las columnas existan en el dataset
    missing_cols = [col for col in columns if col not in df.columns]
    if missing_cols:
        return jsonify({"error": "Las siguientes columnas no se encontraron en el dataset: " + ", ".join(missing_cols)}), 400

    # Verificar que las columnas sean numéricas
    invalid_cols = [col for col in columns if not pd.api.types.is_numeric_dtype(df[col])]
    if invalid_cols:
        return jsonify({"error": "Las siguientes columnas no son numéricas y no pueden ser escaladas: " + ", ".join(invalid_cols)}), 400

    scaler = MinMaxScaler() if scaler_type == "minmax" else StandardScaler()
    df[columns] = scaler.fit_transform(df[columns])
    df.to_csv(DATASET_PATH, index=False)
    return jsonify({"message": f"Escalado '{scaler_type}' aplicado correctamente a las columnas: {', '.join(columns)}"})
    
def fill_nan(data):
    df = load_dataset()
    if df is None:
        return jsonify({"error": error}), 400

    for item in data.get("columns", []):
        column = item.get("column")
        fill_method = item.get("fill_method")
        if not column or column not in df.columns:
            return jsonify({"error": f"La columna '{column}' no existe en el dataset"}), 400

        if fill_method == "mean":
            if not pd.api.types.is_numeric_dtype(df[column]):
                return jsonify({"error": f"La columna '{column}' no es numérica para calcular la media"}), 400
            fill_value = df[column].mean()
        elif fill_method == "median":
            if not pd.api.types.is_numeric_dtype(df[column]):
                return jsonify({"error": f"La columna '{column}' no es numérica para calcular la mediana"}), 400
            fill_value = df[column].median()
        elif fill_method == "mode":
            mode_series = df[column].mode()
            if mode_series.empty:
                return jsonify({"error": f"No se pudo determinar la moda para la columna '{column}'"}), 400
            fill_value = mode_series[0]
        elif fill_method == "constant":
            fill_value = item.get("fill_value")
            if fill_value is None:
                return jsonify({"error": "Debe proporcionar un valor para el llenado constante"}), 400
        else:
            return jsonify({"error": "Método de llenado no soportado"}), 400

        df[column] = df[column].fillna(fill_value)
    
    df.to_csv(DATASET_PATH, index=False)
    return jsonify({"message": "Valores NaN llenados correctamente"})
