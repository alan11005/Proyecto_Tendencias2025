from flask import Blueprint, request, jsonify
from service.PreprocessingService import apply_encoding, detect_missing_values, apply_scaling, fill_nan

preprocessing_bp = Blueprint('preprocessing_bp', __name__)

@preprocessing_bp.route('/apply-encoding', methods=['POST'])
def encoding():
    data = request.get_json()
    return apply_encoding(data)

@preprocessing_bp.route('/detect-missing-values', methods=['GET'])
def missing_values():
    return detect_missing_values()

@preprocessing_bp.route('/apply-scaling', methods=['POST'])
def scaling():
    data = request.get_json()
    return apply_scaling(data)

@preprocessing_bp.route('/fill-nan', methods=['POST'])
def fill_nan_route():
    # Se espera que el usuario envíe: { "column": "nombre_columna", "fill_method": "mean"/"median"/"mode"/"constant", [opcional] "fill_value": valor }
    data = request.get_json()
    return fill_nan(data)