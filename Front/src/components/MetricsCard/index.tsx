import React from "react";
import { TaskTypes } from "@/utils/all";
import { ClassificationMetrics, RegressionMetrics } from "@/utils/types/api/algorithm";

interface MetricsCardProps {
  taskType: TaskTypes;
  metrics: ClassificationMetrics | RegressionMetrics;
}

/**
 * Muestra un "mini dashboard" con métricas,
 * diferenciando si son de clasificación o regresión.
 */
export default function MetricsCard({ taskType, metrics }: MetricsCardProps) {
  if (taskType === TaskTypes.CLASSIFICATION) {
    const classification = metrics as ClassificationMetrics;

    return (
      // Usamos colores con buen contraste en modo claro y oscuro
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 
                      text-gray-800 dark:text-gray-100 border-gray-200 
                      dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Métricas de Clasificación</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
            <strong>Accuracy:</strong> {classification.accuracy.toFixed(3)}
          </div>
          <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
            <strong>Precision:</strong> {classification.precision.toFixed(3)}
          </div>
          <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
            <strong>Recall:</strong> {classification.recall.toFixed(3)}
          </div>
          <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
            <strong>F1:</strong> {classification.f1.toFixed(3)}
          </div>
          <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
            <strong>ROC AUC:</strong> {classification.roc_auc.toFixed(3)}
          </div>
        </div>

        {/* Matriz de confusión */}
        <div className="mt-4">
          <h3 className="font-semibold">Confusion Matrix</h3>
          <table className="mt-2 border border-gray-200 dark:border-gray-700 text-sm">
            <tbody>
              {classification.confusion_matrix.map((row, rowIndex) => (
                <tr key={rowIndex} className="divide-x divide-gray-200 dark:divide-gray-700">
                  {row.map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-1 text-center border border-gray-200 dark:border-gray-700"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Métricas de regresión
  const regression = metrics as RegressionMetrics;
  return (
    <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 
                    text-gray-800 dark:text-gray-100 border-gray-200 
                    dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-bold mb-2">Métricas de Regresión</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
          <strong>MAE:</strong> {regression.mae.toFixed(3)}
        </div>
        <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
          <strong>MEDAE:</strong> {regression.medae.toFixed(3)}
        </div>
        <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
          <strong>
            R<sup>2</sup>:
          </strong>{" "}
          {regression.r2.toFixed(3)}
        </div>
        <div className="p-2 border rounded border-gray-200 dark:border-gray-700">
          <strong>MSE:</strong> {regression.mse.toFixed(3)}
        </div>
      </div>
    </div>
  );
}

