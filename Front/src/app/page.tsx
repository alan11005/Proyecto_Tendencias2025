'use client';

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setDataset,
  uploadDatasetRequest,
  selectTargetRequest,
  setTaskType,
} from "@/store/main/mainSlice";
import { TaskTypes } from "@/utils/all";
import { CsvRow } from "@/utils/all";

export default function UploadDatasetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Estado global: obtén dataset, columns y bandera de si se subió con éxito
  const {
    dataset,
    columns,
    uploadDatasetSuccess,
    uploadDatasetRequesting,
    selectTargetSuccess,
  } = useAppSelector((state) => state.main);

  // Referencia para el input oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // En cuanto detectamos que se ha realizado con éxito el selectTarget,
  // redirigimos a /select-target
  useEffect(() => {
    if (selectTargetSuccess) {
      router.push("/select-target");
    }
  }, [selectTargetSuccess, router]);

  // Se dispara al hacer clic en el botón "Cargar Dataset"
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Se dispara al seleccionar un archivo en el input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Parseamos el archivo con PapaParse
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Guardamos dataset parseado en Redux
        dispatch(setDataset(results.data));
        // Despachamos la request de subir dataset al backend
        dispatch(uploadDatasetRequest({ dataset: results.data }));
      },
      error: (err) => {
        console.error("Error al parsear CSV:", err);
      },
    });
  };

  // Lógica para despachar la acción selectTargetRequest
  const handleSelectClassification = () => {
    dispatch(setTaskType(TaskTypes.CLASSIFICATION));
    dispatch(selectTargetRequest({ task_type: TaskTypes.CLASSIFICATION }));
  };

  const handleSelectRegression = () => {
    dispatch(setTaskType(TaskTypes.REGRESSION));
    dispatch(selectTargetRequest({ task_type: TaskTypes.REGRESSION }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Subir CSV</h1>

      {/* Botón para seleccionar y cargar archivo */}
      <button
        onClick={handleSelectFile}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
        disabled={uploadDatasetRequesting}
      >
        Cargar Dataset
      </button>

      {/* Input de archivo oculto */}
      <input
        placeholder="Selecciona un archivo CSV"
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadDatasetRequesting && (
        <p className="mt-4 text-gray-600">Cargando dataset...</p>
      )}

      {/* Al completar con éxito, mostramos la previsualización */}
      {uploadDatasetSuccess && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Previsualización</h2>

          {/* Tabla de ejemplo con Tailwind */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-100"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                {dataset.slice(0, 5).map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 
                              dark:hover:bg-gray-700"
                  >
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2 text-sm">
                        {row[col]?.toString() ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botones de Clasificación / Regresión */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleSelectClassification}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
            >
              Clasificación
            </button>

            <button
              type="button"
              onClick={handleSelectRegression}
              className="px-4 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700"
            >
              Regresión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
