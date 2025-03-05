'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { trainModelsRequest } from "@/store/main/mainSlice";
import { TaskTypes } from "@/utils/all";

export default function SelectTargetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Obtenemos columnas, algoritmos y tipo de tarea desde el store
  const { 
    columns, 
    algorithms, 
    taskType,
    trainModelsSuccess, 
  } = useAppSelector((state) => state.main);

  // Estados locales para controlar lo seleccionado
  const [targetColumn, setTargetColumn] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);

  // Maneja el toggle de cada algoritmo (checkbox)
  const handleAlgorithmToggle = (algorithm: string) => {
    if (selectedAlgorithms.includes(algorithm)) {
      // Si ya está seleccionado, lo removemos
      setSelectedAlgorithms(selectedAlgorithms.filter((a) => a !== algorithm));
    } else {
      // Si no está seleccionado, lo agregamos
      setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
    }
  };

  useEffect(() => {
    if (trainModelsSuccess) {
      router.push("/results");
    }
  }, [trainModelsSuccess, router]);

  // Al hacer clic en "Entrenar"
  const handleTrainModels = () => {
    if (!targetColumn) {
      alert("Debes seleccionar una columna a predecir.");
      return;
    }
    if (selectedAlgorithms.length === 0) {
      alert("Debes seleccionar al menos un modelo para entrenar.");
      return;
    }

    // Despachamos la request con los datos necesarios
    dispatch(
      trainModelsRequest({
        target_column: targetColumn,
        task_type: taskType as TaskTypes,
        algorithms: selectedAlgorithms,
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Seleccionar Target y Modelos</h1>

      {/* SELECT TARGET COLUMN */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Columna Target</label>
        <select
          value={targetColumn}
          onChange={(e) => setTargetColumn(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded 
                    bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 
                    px-3 py-2 w-full"
          title="Selecciona la columna objetivo"
        >
          <option value="">-- Selecciona la columna objetivo --</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
</select>
      </div>

      {/* SELECT ALGORITHMS */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Modelos a entrenar</label>
        <div className="grid grid-cols-2 gap-2">
          {algorithms.map((algo) => {
            const isChecked = selectedAlgorithms.includes(algo);
            return (
              <label key={algo} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAlgorithmToggle(algo)}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{algo}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleTrainModels}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
      >
        Entrenar
      </button>
    </div>
  );
}
