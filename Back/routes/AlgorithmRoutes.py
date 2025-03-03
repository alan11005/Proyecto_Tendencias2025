from flask import Blueprint, request, jsonify, send_file
from service.AlgorithmService import upload_dataset, select_target, train_models, get_metrics, predict, download_model

algorithm_bp = Blueprint('algorithm_bp', __name__)

@algorithm_bp.route('/upload-dataset', methods=['POST'])
def upload():
    file = request.get_json()['dataset']
    return upload_dataset(file)

@algorithm_bp.route('/select-target', methods=['POST'])
def select():
    task_type = request.get_json()['task_type']
    print(task_type)
    return select_target(task_type)

@algorithm_bp.route('/train', methods=['POST'])
def train():
    data = request.get_json()
    target_column = data.get("target_column")
    task_type = data.get("task_type")
    selected_algorithms = data.get("algorithms", [])
    # hyperparameters = data.get("hyperparameters", {})
    return train_models(target_column, task_type, selected_algorithms)

@algorithm_bp.route('/metrics', methods=['GET'])
def metrics():
    data = request.get_json()
    model_id = data.get("model_id")
    task_type = data.get("task_type")
    return get_metrics(model_id, task_type)

@algorithm_bp.route('/predict', methods=['POST'])
def predict_route():
    data = request.get_json()
    model_id = data.get("model_id")
    inputs = data.get("inputs")
    target = data.get("target")
    return predict(model_id, inputs, target)

@algorithm_bp.route('/download/<model_id>', methods=['GET'])
def download(model_id):
    return download_model(model_id)
