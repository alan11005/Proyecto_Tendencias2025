'use client';

import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { metricsRequest } from "@/store/main/mainSlice";
import { TaskTypes } from "@/utils/all";
import MetricsCard from "@/components/MetricsCard";

export default function ResultsPage() {
  const dispatch = useAppDispatch();

  const {
    models,
    testMetrics,
    trainMetrics,
    metricsRequesting,
    metricsError,
    taskType,
  } = useAppSelector((state) => state.main);

  // Ref para evitar que el effect se ejecute 2 veces en Strict Mode
  const didRequestMetrics = useRef(false);

  // Al cargar la página, pedimos las métricas de cada modelo
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

  // 1. Creamos un Set con los IDs que aparecen en testMetrics o trainMetrics
  const modelIds = new Set<string>();

  testMetrics?.forEach((tm) => modelIds.add(tm.id));
  trainMetrics?.forEach((tm) => modelIds.add(tm.id));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Resultados de los Modelos Entrenados</h1>

      {metricsRequesting && <p className="text-gray-600">Cargando métricas...</p>}

      {metricsError && (
        <p className="text-red-600">Error al obtener métricas: {metricsError}</p>
      )}

      {/* Para cada ID, mostramos las métricas de TRAIN y TEST */}
      {Array.from(modelIds).map((id) => {
        // Obtenemos las métricas de test y train para este ID
        const test = testMetrics?.find((item) => item.id === id);
        const train = trainMetrics?.find((item) => item.id === id);

        // El nombre de modelo puede estar en test o en train (donde primero aparezca)
        const modelName = test?.model_name || train?.model_name || "Desconocido";

        return (
          <div key={id} className="border rounded p-4 mb-6 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Modelo: {modelName}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sección de Train Metrics */}
              <div className="p-2 border rounded bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2">Entrenamiento</h3>
                {train ? (
                  <MetricsCard taskType={taskType as TaskTypes} metrics={train.metrics} />
                ) : (
                  <p className="text-sm italic">No hay métricas de entrenamiento para este modelo.</p>
                )}
              </div>

              {/* Sección de Test Metrics */}
              <div className="p-2 border rounded bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-2">Prueba</h3>
                {test ? (
                  <MetricsCard taskType={taskType as TaskTypes} metrics={test.metrics} />
                ) : (
                  <p className="text-sm italic">No hay métricas de prueba para este modelo.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
