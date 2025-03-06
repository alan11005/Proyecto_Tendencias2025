import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CsvRow,
  TaskTypes,
} from "@/utils/all";
import {
  ModelScoreData,
  ClassificationMetrics,
  RegressionMetrics,
  UploadDatasetRequest,
  UploadDatasetResponse,
  SelectTargetRequest,
  SelectTargetResponse,
  TrainModelsRequest,
  TrainModelsResponse,
  MetricsRequest,
  MetricsResponse,
  DownloadRequest,
} from "@/utils/types/api/algorithm";

// Definimos la forma de nuestro estado
interface MainState {
  dataset: CsvRow[];                      // Datos del CSV parseados
  columns: string[];                      // Columnas del CSV
  targetColumn: string;                   // Columna objetivo elegida
  taskType: TaskTypes |  "";                    // Tipo de tarea (regresión/clasificación)
  algorithms: string[];                   // Algoritmos disponibles
  bestModel: string;                      // Nombre del mejor modelo
  models: { [modelName: string]: ModelScoreData }; // Info de cada modelo entrenado

  trainMetrics:  null | {
    id: string
    model_name: string
    metrics: ClassificationMetrics | RegressionMetrics
  }[];
  testMetrics: null | {
    id: string
    model_name: string
    metrics: ClassificationMetrics | RegressionMetrics
  }[];

  predictionResult: number | null;        // Resultado de la predicción

  // Para controlar estados de carga/éxito/error por cada operación
  uploadDatasetRequesting: boolean;
  uploadDatasetSuccess: boolean;
  uploadDatasetError: string;

  selectTargetRequesting: boolean;
  selectTargetSuccess: boolean;
  selectTargetError: string;

  trainModelsRequesting: boolean;
  trainModelsSuccess: boolean;
  trainModelsError: string;

  metricsRequesting: boolean;
  metricsSuccess: boolean;
  metricsError: string;

  downloadRequesting: boolean;
  downloadSuccess: boolean;
  downloadError: string;
}

// Estado inicial
const initialState: MainState = {
  dataset: [],
  columns: [],
  targetColumn: "",
  taskType: "",
  algorithms: [],
  bestModel: "",
  models: {},

  trainMetrics: null,
  testMetrics: null,

  predictionResult: null,

  uploadDatasetRequesting: false,
  uploadDatasetSuccess: false,
  uploadDatasetError: "",

  selectTargetRequesting: false,
  selectTargetSuccess: false,
  selectTargetError: "",

  trainModelsRequesting: false,
  trainModelsSuccess: false,
  trainModelsError: "",

  metricsRequesting: false,
  metricsSuccess: false,
  metricsError: "",

  downloadRequesting: false,
  downloadSuccess: false,
  downloadError: "",
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    // -------------------------------
    // UPLOAD DATASET
    // -------------------------------
    uploadDatasetRequest: (state, _action: PayloadAction<UploadDatasetRequest>) => {
      state.uploadDatasetRequesting = true;
      state.uploadDatasetSuccess = false;
      state.uploadDatasetError = "";
    },
    uploadDatasetSuccess: (state, action: PayloadAction<UploadDatasetResponse>) => {
      state.uploadDatasetRequesting = false;
      state.uploadDatasetSuccess = true;
      state.uploadDatasetError = "";
      // Guardamos data relevante de la respuesta
      state.columns = action.payload.columns;
      // NOTA: asumiendo que el "dataset" lo parseas antes (Papaparse) y lo asignarás por saga o manualmente
      // Si deseas, podrías incluir más data de `UploadDatasetResponse` aquí
    },
    uploadDatasetFailure: (state, action: PayloadAction<string>) => {
      state.uploadDatasetRequesting = false;
      state.uploadDatasetSuccess = false;
      state.uploadDatasetError = action.payload;
    },

    // -------------------------------
    // SELECT TARGET
    // -------------------------------
    selectTargetRequest: (state, _action: PayloadAction<SelectTargetRequest>) => {
      state.selectTargetRequesting = true;
      state.selectTargetSuccess = false;
      state.selectTargetError = "";
    },
    selectTargetSuccess: (state, action: PayloadAction<SelectTargetResponse>) => {
      state.selectTargetRequesting = false;
      state.selectTargetSuccess = true;
      state.selectTargetError = "";
      // Guardamos los algoritmos de la respuesta
      state.algorithms = action.payload.algorithms;
    },
    selectTargetFailure: (state, action: PayloadAction<string>) => {
      state.selectTargetRequesting = false;
      state.selectTargetSuccess = false;
      state.selectTargetError = action.payload;
    },

    // -------------------------------
    // TRAIN MODELS
    // -------------------------------
    trainModelsRequest: (state, _action: PayloadAction<TrainModelsRequest>) => {
      state.trainModelsRequesting = true;
      state.trainModelsSuccess = false;
      state.trainModelsError = "";
    },
    trainModelsSuccess: (state, action: PayloadAction<TrainModelsResponse>) => {
      state.trainModelsRequesting = false;
      state.trainModelsSuccess = true;
      state.trainModelsError = "";
      state.bestModel = action.payload.best_model;
      state.models = action.payload.models;
    },
    trainModelsFailure: (state, action: PayloadAction<string>) => {
      state.trainModelsRequesting = false;
      state.trainModelsSuccess = false;
      state.trainModelsError = action.payload;
    },

    // -------------------------------
    // GET METRICS
    // -------------------------------
    metricsRequest: (
      state, 
      _action: PayloadAction<MetricsRequest & {
        model_name: string
      }>
    ) => {
      state.metricsRequesting = true;
      state.metricsSuccess = false;
      state.metricsError = "";
    },
    metricsSuccess: (
      state,
      action: PayloadAction<MetricsResponse & {
        model_id: string
        model_name: string
      }>
    ) => {
      state.metricsRequesting = false;
      state.metricsSuccess = true;
      state.metricsError = "";
      const testMetrics = action.payload.metrics_test;
      if (state.testMetrics === null) {
        state.testMetrics = [];
      }
      state.testMetrics.push({
        id: action.payload.model_id,
        model_name: action.payload.model_name,
        metrics: testMetrics,
      });
      const trainMetrics = action.payload.metrics_train;
      if (state.trainMetrics === null) {
        state.trainMetrics = [];
      }
      state.trainMetrics.push({
        id: action.payload.model_id,
        model_name: action.payload.model_name,
        metrics: trainMetrics,
      });
    },
    metricsFailure: (state, action: PayloadAction<string>) => {
      state.metricsRequesting = false;
      state.metricsSuccess = false;
      state.metricsError = action.payload;
    },

    // -------------------------------
    // DOWNLOAD
    // -------------------------------
    downloadRequest: (state, _action: PayloadAction<DownloadRequest>) => {
      state.downloadRequesting = true;
      state.downloadSuccess = false;
      state.downloadError = "";
    },
    downloadSuccess: (state) => {
      state.downloadRequesting = false;
      state.downloadSuccess = true;
      state.downloadError = "";
    },
    downloadFailure: (state, action: PayloadAction<string>) => {
      state.downloadRequesting = false;
      state.downloadSuccess = false;
      state.downloadError = action.payload;
    },

    // -------------------------------
    // Acciones sincrónicas útiles
    // -------------------------------
    setDataset: (state, action: PayloadAction<CsvRow[]>) => {
      // Por ejemplo, si parseas el CSV en el frontend
      // y quieres guardarlo directamente en el slice
      state.dataset = action.payload;
    },
    setTargetColumn: (state, action: PayloadAction<string>) => {
      state.targetColumn = action.payload;
    },
    setTaskType: (state, action: PayloadAction<TaskTypes>) => {
      state.taskType = action.payload;
    },
  },
});

// Exportamos acciones y reducer
export const {
  uploadDatasetRequest,
  uploadDatasetSuccess,
  uploadDatasetFailure,

  selectTargetRequest,
  selectTargetSuccess,
  selectTargetFailure,

  trainModelsRequest,
  trainModelsSuccess,
  trainModelsFailure,

  metricsRequest,
  metricsSuccess,
  metricsFailure,

  downloadRequest,
  downloadSuccess,
  downloadFailure,

  setDataset,
  setTargetColumn,
  setTaskType,
} = mainSlice.actions;

export default mainSlice.reducer;
