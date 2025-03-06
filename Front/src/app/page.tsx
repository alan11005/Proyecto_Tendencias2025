"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";

// ACCIONES DE MAIN
import {
  setDataset,
  uploadDatasetRequest,
  selectTargetRequest,
  setTaskType,
} from "@/store/main/mainSlice";

// ACCIONES DE PREPROCESS
import {
  detectMissingRequest,
  fillNullsRequest,
  applyEncodingRequest,
  applyScalingRequest,
} from "@/store/preprocess/preprocessSlice";

import { TaskTypes, FillMethodTypes, EncodingTypes, ScalerTypes } from "@/utils/all";
import { CsvRow } from "@/utils/all";

export default function UploadDatasetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // ----------------------------
  // ESTADO GLOBAL: MAIN
  // ----------------------------
  const {
    dataset,
    columns,
    uploadDatasetSuccess,
    uploadDatasetRequesting,
    selectTargetSuccess,
  } = useAppSelector((state) => state.main);

  // ----------------------------
  // ESTADO GLOBAL: PREPROCESS
  // ----------------------------
  const {
    missingValues,
    detectMissingRequesting,
    detectMissingSuccess,
    fillNullsRequesting,
    fillNullsSuccess,
    applyEncodingRequesting,
    applyEncodingSuccess,
    applyScalingRequesting,
    applyScalingSuccess,
  } = useAppSelector((state) => state.preprocess);

  // REFERENCIA PARA INPUT DE ARCHIVO
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Selección de dataset";
  }, []);

  // ----------------------------
  // 1) DETECTAR NULOS AL SUBIR DATASET
  // ----------------------------
  useEffect(() => {
    if (uploadDatasetSuccess) {
      dispatch(detectMissingRequest());
    }
  }, [uploadDatasetSuccess, dispatch]);

  // ----------------------------
  // 2) RELLENAR NULOS
  // ----------------------------
  // Creamos estado local para fillNulls:
  const [fillConfig, setFillConfig] = useState<
    { column: string; fill_method: FillMethodTypes; fill_value?: string }[]
  >([]);

  useEffect(() => {
    if (detectMissingSuccess && missingValues) {
      const columnsWithMissing = Object.keys(missingValues).filter(
        (col) => missingValues[col] > 0
      );
      const initialConfig = columnsWithMissing.map((col) => ({
        column: col,
        fill_method: FillMethodTypes.MEAN,
        fill_value: "",
      }));
      setFillConfig(initialConfig);
    }
  }, [detectMissingSuccess, missingValues]);

  const handleFillMethodChange = (
    column: string,
    newMethod: FillMethodTypes
  ) => {
    setFillConfig((prev) =>
      prev.map((item) =>
        item.column === column
          ? { ...item, fill_method: newMethod, fill_value: "" }
          : item
      )
    );
  };
  const handleFillValueChange = (column: string, value: string) => {
    setFillConfig((prev) =>
      prev.map((item) =>
        item.column === column ? { ...item, fill_value: value } : item
      )
    );
  };
  const handleApplyFill = () => {
    dispatch(
      fillNullsRequest({
        columns: fillConfig,
      })
    );
  };

  // ----------------------------
  // 3) TRANSFORMACIONES (ENCODING / SCALING)
  // ----------------------------
  // Generamos un estado para cada columna, donde el usuario puede elegir:
  // "none" | "encoding" | "scaling", y según la elección, especificar encodingType o scalerType.
  type TransformType = "none" | "encoding" | "scaling";
  interface TransformationConfig {
    column: string;
    transformType: TransformType; // 'none' | 'encoding' | 'scaling'
    encodingType?: EncodingTypes;
    scalerType?: ScalerTypes;
  }

  // Estado local con transformaciones
  const [transformConfig, setTransformConfig] = useState<TransformationConfig[]>([]);

  // Al cambiar columns (o fillNullsSuccess), creamos un array base de transformConfig
  // (solo si no existe uno)
  useEffect(() => {
    // Solo iniciamos si hay fillNullsSuccess (o no había nulos) -> es cuando pasamos al paso de transform
    const columnsWithMissing = Object.keys(missingValues).filter((col) => missingValues[col] > 0);
    const noMissingOrFixed = columnsWithMissing.length === 0 || fillNullsSuccess;

    if (noMissingOrFixed && transformConfig.length === 0 && columns.length > 0) {
      const initialTransform = columns.map((col) => ({
        column: col,
        transformType: "none" as TransformType,
        encodingType: EncodingTypes.ONE_HOT,
        scalerType: ScalerTypes.STANDARD,
      }));
      setTransformConfig(initialTransform);
    }
  }, [columns, missingValues, fillNullsSuccess, transformConfig]);

  // Handlers para cambio de transformType
  const handleTransformTypeChange = (col: string, transformType: TransformType) => {
    setTransformConfig((prev) =>
      prev.map((item) =>
        item.column === col
          ? { ...item, transformType }
          : item
      )
    );
  };

  // Handlers para cambio de encodingType
  const handleEncodingTypeChange = (col: string, encoding: EncodingTypes) => {
    setTransformConfig((prev) =>
      prev.map((item) =>
        item.column === col
          ? { ...item, encodingType: encoding }
          : item
      )
    );
  };

  // Handlers para cambio de scalingType
  const handleScalingTypeChange = (col: string, scaling: ScalerTypes) => {
    setTransformConfig((prev) =>
      prev.map((item) =>
        item.column === col
          ? { ...item, scalerType: scaling }
          : item
      )
    );
  };

  // Al presionar "Aplicar transformaciones"
  const handleApplyTransformations = () => {
    // 1. Separamos las columnas que pidieron "encoding" y "scaling"
    const encodingCols = transformConfig
      .filter((t) => t.transformType === "encoding")
      .map((t) => t.column);
    const scalingCols = transformConfig
      .filter((t) => t.transformType === "scaling")
      .map((t) => t.column);

    // 2. Revisar si no hay transformaciones
    if (encodingCols.length === 0 && scalingCols.length === 0) {
      // No hay peticiones, podemos marcar como completado a mano (o,
      // simplemente no despachamos nada y actualizamos algún flag local
      // que indique "transformaciones completadas")
      setTransformationsDone(true);
      return;
    }

    // 3. Si hay encoding y hay scaling, despachamos AMBAS en paralelo
    // y esperamos que se completen. O puedes despacharlas y ver en la UI cuando
    // applyEncodingSuccess y applyScalingSuccess sean true.
    if (encodingCols.length > 0 && scalingCols.length > 0) {
      dispatch(
        applyEncodingRequest({
          columns: encodingCols,
          encoding_type: transformConfig.find((t) => t.transformType === "encoding")
            ?.encodingType || EncodingTypes.ONE_HOT,
        })
      );
      dispatch(
        applyScalingRequest({
          columns: scalingCols,
          scaler_type: transformConfig.find((t) => t.transformType === "scaling")
            ?.scalerType || ScalerTypes.STANDARD,
        })
      );
      return;
    }

    // 4. Si solo hay encoding
    if (encodingCols.length > 0) {
      dispatch(
        applyEncodingRequest({
          columns: encodingCols,
          encoding_type: transformConfig.find((t) => t.transformType === "encoding")
            ?.encodingType || EncodingTypes.ONE_HOT,
        })
      );
    }

    // 5. Si solo hay scaling
    if (scalingCols.length > 0) {
      dispatch(
        applyScalingRequest({
          columns: scalingCols,
          scaler_type: transformConfig.find((t) => t.transformType === "scaling")
            ?.scalerType || ScalerTypes.STANDARD,
        })
      );
    }
  };

  // Flag local para saber si "no se necesitó" peticiones o si ya las completamos
  const [transformationsDone, setTransformationsDone] = useState(false);

  // Cuando ambos successes sean true (o uno de ellos, si era lo único que pedíamos),
  // marcamos las transformaciones como completadas
  useEffect(() => {
    // Si no se han despachado transformaciones, skip
    // Si en la UI detectas que se despacharon, puedes guardar un flag,
    // o simplemente compruebas si había encodingCols/scalingCols
    // En este ejemplo, haremos la siguiente lógica simple:

    // Si las dos peticiones se hicieron, esperamos a que ambas successes estén true
    // Si solo una se hizo, esperamos a que su success esté true
    const encodingCols = transformConfig.filter((t) => t.transformType === "encoding");
    const scalingCols = transformConfig.filter((t) => t.transformType === "scaling");

    if (encodingCols.length > 0 && scalingCols.length > 0) {
      // Esperamos a applyEncodingSuccess && applyScalingSuccess
      if (applyEncodingSuccess && applyScalingSuccess) {
        setTransformationsDone(true);
      }
    } else if (encodingCols.length > 0) {
      // Solo encoding
      if (applyEncodingSuccess) {
        setTransformationsDone(true);
      }
    } else if (scalingCols.length > 0) {
      // Solo scaling
      if (applyScalingSuccess) {
        setTransformationsDone(true);
      }
    }
  }, [
    applyEncodingSuccess,
    applyScalingSuccess,
    transformConfig,
  ]);

  // ----------------------------
  // 4) CUANDO SELECCIONAMOS TARGET, REDIRIGIMOS
  // ----------------------------
  useEffect(() => {
    if (selectTargetSuccess) {
      router.push("/select-target");
    }
  }, [selectTargetSuccess, router]);

  // ----------------------------
  // 5) SUBIR ARCHIVO CSV
  // ----------------------------
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        dispatch(setDataset(results.data));
        dispatch(uploadDatasetRequest({ dataset: results.data }));
      },
      error: (err) => {
        console.error("Error al parsear CSV:", err);
      },
    });
  };

  // ----------------------------
  // 6) SELECCIONAR CLASIFICACIÓN/REGRESIÓN
  // ----------------------------
  const handleSelectClassification = () => {
    dispatch(setTaskType(TaskTypes.CLASSIFICATION));
    dispatch(selectTargetRequest({ task_type: TaskTypes.CLASSIFICATION }));
  };
  const handleSelectRegression = () => {
    dispatch(setTaskType(TaskTypes.REGRESSION));
    dispatch(selectTargetRequest({ task_type: TaskTypes.REGRESSION }));
  };

  // Para saber si hay columnas con missing
  const columnsWithMissing = Object.keys(missingValues).filter((col) => missingValues[col] > 0);
  // Se pueden seleccionar transformaciones solo si fillNullsSuccess
  // o no había missing => columnsWithMissing.length === 0
  const canSelectTransform =
    columnsWithMissing.length === 0 || fillNullsSuccess === true;

  // Se pueden seleccionar "Clasificación/Regresión" solo si:
  // - Se completaron (o no existían) nulos,
  // - Se completaron (o no existían) transformaciones
  const canSelectTask = canSelectTransform && (transformationsDone || noTransformationsSelected());

  function noTransformationsSelected() {
    return transformConfig.every((tc) => tc.transformType === "none");
  }

  return (
    <>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Subir CSV</h1>

        <button
          onClick={handleSelectFile}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
          disabled={uploadDatasetRequesting}
        >
          Cargar Dataset
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          placeholder="Selecciona un archivo CSV"
        />

        {uploadDatasetRequesting && <p className="mt-4 text-gray-600">Cargando dataset...</p>}

        {/* PREVISUALIZACIÓN */}
        {uploadDatasetSuccess && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Previsualización</h2>
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
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
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

            {/* FILL NULLS UI */}
            {detectMissingRequesting && (
              <p className="mt-4 text-gray-600">Detectando valores faltantes...</p>
            )}
            {detectMissingSuccess &&
              columnsWithMissing.length > 0 &&
              !fillNullsSuccess && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Columnas con valores faltantes</h2>
                  <p className="text-sm text-gray-600">
                    Selecciona el método de relleno para cada columna.
                  </p>
                  <div className="mt-4 space-y-4">
                    {fillConfig.map((cfg) => (
                      <div key={cfg.column} className="flex items-center gap-4">
                        <span className="w-1/4 font-medium">{cfg.column}</span>
                        <select
                          value={cfg.fill_method}
                          onChange={(e) =>
                            handleFillMethodChange(cfg.column, e.target.value as FillMethodTypes)
                          }
                          className="
                            appearance-none
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-800
                            text-gray-800 dark:text-gray-100
                            rounded
                            px-2 py-1
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            transition-colors
                          "
                          title={`Método de relleno para ${cfg.column}`}
                        >
                          {Object.values(FillMethodTypes).map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>

                        {cfg.fill_method === FillMethodTypes.CONSTANT && (
                          <input
                            type="text"
                            placeholder="Valor constante"
                            value={cfg.fill_value}
                            onChange={(e) => handleFillValueChange(cfg.column, e.target.value)}
                            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleApplyFill}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                      disabled={fillNullsRequesting}
                    >
                      {fillNullsRequesting ? "Aplicando relleno..." : "Aplicar relleno"}
                    </button>
                  </div>
                </div>
              )}

            {/* TRANSFORMACIONES (sólo si no hay missing o ya se rellenaron) */}
            {canSelectTransform && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Transformaciones (Opcional)</h2>
                <p className="text-sm text-gray-600">
                  Selecciona un tipo de transformación (encoding o scaling) por columna, o "none" para no aplicar nada.
                </p>
                <div className="mt-4 space-y-4">
                  {transformConfig.map((t) => (
                    <div key={t.column} className="flex items-center gap-4">
                      <span className="w-1/4 font-medium">{t.column}</span>

                      {/* Tipo de transformación */}
                      <select
                        value={t.transformType}
                        onChange={(e) =>
                          handleTransformTypeChange(
                            t.column,
                            e.target.value as TransformType
                          )
                        }
                        className="appearance-none
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50 dark:bg-gray-800
                          text-gray-800 dark:text-gray-100
                          rounded
                          px-2 py-1
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                          transition-colors
                        "
                        title={`Tipo de transformación para ${t.column}`}
                      >
                        <option value="none">Ninguna</option>
                        <option value="encoding">Encoding</option>
                        <option value="scaling">Scaling</option>
                      </select>

                      {/* Si encoding, escogemos el encodingType */}
                      {t.transformType === "encoding" && (
                        <select
                          value={t.encodingType}
                          onChange={(e) =>
                            handleEncodingTypeChange(
                              t.column,
                              e.target.value as EncodingTypes
                            )
                          }
                          className="appearance-none
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-800
                            text-gray-800 dark:text-gray-100
                            rounded
                            px-2 py-1
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            transition-colors
                          "
                          title={`Tipo de encoding para ${t.column}`}
                        >
                          {Object.values(EncodingTypes).map((enc) => (
                            <option key={enc} value={enc}>
                              {enc}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Si scaling, escogemos el scalerType */}
                      {t.transformType === "scaling" && (
                        <select
                          value={t.scalerType}
                          onChange={(e) =>
                            handleScalingTypeChange(
                              t.column,
                              e.target.value as ScalerTypes
                            )
                          }
                          className="
                            appearance-none
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-800
                            text-gray-800 dark:text-gray-100
                            rounded
                            px-2 py-1
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            transition-colors
                          "
                          title={`Tipo de scaling para ${t.column}`}
                        >
                          {Object.values(ScalerTypes).map((sc) => (
                            <option key={sc} value={sc}>
                              {sc}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>

                {/* Botón para aplicar transformaciones */}
                <div className="mt-4">
                  <button
                    onClick={handleApplyTransformations}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                    disabled={applyEncodingRequesting || applyScalingRequesting}
                  >
                    {applyEncodingRequesting || applyScalingRequesting
                      ? "Aplicando transformaciones..."
                      : "Aplicar transformaciones"}
                  </button>
                </div>
              </div>
            )}

            {/* Botones de Clasificación / Regresión */}
            {canSelectTask && (
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
            )}
          </div>
        )}
      </div>
    </>
  );
}
