#!/bin/bash

trap 'kill 0' EXIT

echo "Iniciando Back-End de Flask en el puerto 5000..."
cd Back
source .venv/Scripts/activate
python app.py &
cd ..

echo "Iniciando Front-End en el puerto 3000..."
cd Front
npm run dev &
cd ..

echo "Todos los servicios se han iniciado. Presiona CTRL+C para detener."

wait
