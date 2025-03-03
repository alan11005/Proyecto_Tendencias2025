from flask import Flask, render_template
from flask_cors import CORS

from routes import AlgorithmRoutes

app = Flask(__name__)
CORS(app)

def init_app():
    app.register_blueprint(AlgorithmRoutes.algorithm_bp, url_prefix='/app/algorithm')
    app.run(debug=True)

    return app

if __name__ == '__main__':
    init_app()


