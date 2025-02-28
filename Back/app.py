from flask import Flask, render_template

from routes import AlgorithmRoutes

app = Flask(__name__)

def init_app():
    app.register_blueprint(AlgorithmRoutes.algorithm_bp, url_prefix='/app/algorithm')
    app.run(debug=True)

    return app

if __name__ == '__main__':
    init_app()


