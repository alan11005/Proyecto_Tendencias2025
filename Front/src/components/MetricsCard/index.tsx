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
      <div
        className="p-4 border rounded bg-gray-50 dark:bg-gray-800
        text-gray-800 dark:text-gray-100 border-gray-200
        dark:border-gray-700 shadow-sm"
      >
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
          <h3 className="font-semibold">Matriz de Confusión</h3>
          {is2x2Matrix(classification.confusion_matrix) ? (
            <ConfusionMatrix2x2 matrix={classification.confusion_matrix} />
          ) : (
            <GenericConfusionMatrix matrix={classification.confusion_matrix} />
          )}
        </div>
      </div>
    );
  }

  // Métricas de regresión
  const regression = metrics as RegressionMetrics;
  return (
    <div
      className="p-4 border rounded bg-gray-50 dark:bg-gray-800
      text-gray-800 dark:text-gray-100 border-gray-200
      dark:border-gray-700 shadow-sm"
    >
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

/** Comprueba si la matriz es 2x2 */
function is2x2Matrix(matrix: number[][]) {
  return (
    matrix.length === 2 &&
    matrix[0].length === 2 &&
    matrix[1].length === 2
  );
}

/** Renderiza una matriz de confusión 2x2 con labels TN, FP, FN, TP */
function ConfusionMatrix2x2({ matrix }: { matrix: number[][] }) {
  const [[tn, fp], [fn, tp]] = matrix;
  return (
    <table className="mt-2 border border-gray-200 dark:border-gray-700 text-sm w-full">
      <thead className="bg-gray-100 dark:bg-gray-800">
        <tr>
          <th className="p-2"></th>
          <th className="p-2 text-center">Real Positivo</th>
          <th className="p-2 text-center">Real Negativo</th>
        </tr>
      </thead>
      <tbody>
        <tr className="divide-x divide-gray-200 dark:divide-gray-700">
          <th className="p-2 text-left bg-gray-50 dark:bg-gray-900">Pred. Positivo</th>
          <td className="px-3 py-2 text-center border border-gray-200 dark:border-gray-700">
            <strong>Verdaderos Positivos (TP):</strong> {tp}
          </td>
          <td className="px-3 py-2 text-center border border-gray-200 dark:border-gray-700">
            <strong>Falsos Positivos (FP):</strong> {fp}
          </td>
        </tr>
        <tr className="divide-x divide-gray-200 dark:divide-gray-700">
          <th className="p-2 text-left bg-gray-50 dark:bg-gray-900">Pred. Negativo</th>
          <td className="px-3 py-2 text-center border border-gray-200 dark:border-gray-700">
            <strong>Falsos Negativos (FN):</strong> {fn}
          </td>
          <td className="px-3 py-2 text-center border border-gray-200 dark:border-gray-700">
            <strong>Verdaderos Negativos (TN):</strong> {tn}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Renderizado genérico si no es 2x2 */
function GenericConfusionMatrix({ matrix }: { matrix: number[][] }) {
  return (
    <table className="mt-2 border border-gray-200 dark:border-gray-700 text-sm">
      <tbody>
        {matrix.map((row, rowIndex) => (
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
  );
}
