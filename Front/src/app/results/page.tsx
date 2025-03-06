"use client";

import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { metricsRequest, downloadRequest } from "@/store/main/mainSlice";
import { TaskTypes } from "@/utils/all";
import MetricsCard from "@/components/MetricsCard";

export default function ResultsPage() {
  const dispatch = useAppDispatch();
  const {
    models,            // { [modelName: string]: ModelScoreData }
    testMetrics,
    trainMetrics,
    metricsRequesting,
    metricsError,
    taskType,
  } = useAppSelector((state) => state.main);

  // Ref para evitar doble request en Strict Mode
  const didRequestMetrics = useRef(false);

  useEffect(() => {
    document.title = "Resultados del entrenamiento";
  }, []);

  // Al montar, solicitamos las métricas de cada modelo (solo una vez)
  useEffect(() => {
    if (didRequestMetrics.current) return;

    const modelNames = Object.keys(models);
    if (modelNames.length > 0) {
      modelNames.forEach((modelName) => {
        const modelInfo = models[modelName];
        dispatch(
          metricsRequest({
            model_id: modelInfo.id,
            model_name: modelName,
            task_type: taskType as TaskTypes,
          })
        );
      });
      didRequestMetrics.current = true;
    }
  }, [models, taskType, dispatch]);

  // Coleccionamos los IDs que aparecen en testMetrics o trainMetrics
  const modelIds = new Set<string>();
  testMetrics?.forEach((tm) => modelIds.add(tm.id));
  trainMetrics?.forEach((tm) => modelIds.add(tm.id));

  // Manejador para descargar el modelo entrenado
  const handleDownload = (modelId: string) => {
    dispatch(downloadRequest({ model_id: modelId }));
  };

  // ---------------------------
  // Generar un ranking de modelos por score
  // ---------------------------
  // models: { [modelName: string]: { id: string; score: number } }
  // Ordenamos en forma descendente por "score"
  const sortedModels = Object.entries(models).sort(
    ([, modelA], [, modelB]) => modelB.score - modelA.score
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Resultados de los Modelos Entrenados</h1>

      {metricsRequesting && (
        <p className="text-gray-600">Cargando métricas...</p>
      )}
      {metricsError && (
        <p className="text-red-600">Error al obtener métricas: {metricsError}</p>
      )}

      {/* Para cada modelo ID, mostramos métricas de Train y Test */}
      {Array.from(modelIds).map((id) => {
        // Obtenemos las métricas de test / train para este modelo
        const test = testMetrics?.find((item) => item.id === id);
        const train = trainMetrics?.find((item) => item.id === id);

        // Nombre de modelo (puede provenir de test o train)
        const modelName = test?.model_name || train?.model_name || "Desconocido";

        return (
          <div
            key={id}
            className="border rounded p-4 mb-6 bg-gray-50 dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold mb-4">Modelo: {modelName}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Métricas de Entrenamiento */}
              <div className="p-2 border rounded bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2">Entrenamiento</h3>
                {train ? (
                  <MetricsCard taskType={taskType as TaskTypes} metrics={train.metrics} />
                ) : (
                  <p className="text-sm italic">
                    No hay métricas de entrenamiento para este modelo.
                  </p>
                )}
              </div>

              {/* Métricas de Prueba */}
              <div className="p-2 border rounded bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2">Prueba</h3>
                {test ? (
                  <MetricsCard taskType={taskType as TaskTypes} metrics={test.metrics} />
                ) : (
                  <p className="text-sm italic">
                    No hay métricas de prueba para este modelo.
                  </p>
                )}
              </div>
            </div>

            {/* Botón para descargar el modelo */}
            <button
              onClick={() => handleDownload(id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Descargar modelo entrenado
            </button>
          </div>
        );
      })}

      {/* Ranking de modelos por score */}
      {sortedModels.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Ranking de Modelos por Score</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-200 dark:border-gray-700">
            {sortedModels.map(([modelName, modelData], index) => (
              <p key={modelData.id} className="mb-1 text-sm">
                <strong>#{index + 1}</strong> - {modelName} | Score:{" "}
                {modelData.score.toFixed(3)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
