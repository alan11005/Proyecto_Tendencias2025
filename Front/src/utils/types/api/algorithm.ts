import { CsvRow, TaskTypes } from "../../all";

export interface ModelScoreData {
  id: string;
  score: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
}

export interface RegressionMetrics {
  mae: number;
  medae: number;
  r2: number;
  score: number;
}

export interface UploadDatasetRequest {
  dataset: CsvRow[];
}

export interface UploadDatasetResponse {
  message: string;
  columns: string[];
}

export interface SelectTargetRequest {
  task_type: TaskTypes;
}

export interface SelectTargetResponse {
  algorithms: string[];
}

export interface TrainModelsRequest {
  target_column: string;
  task_type: TaskTypes;
  algorithms: string[];
}

export interface TrainModelsResponse {
  best_model: string;
  models: {
    [modelName: string]: ModelScoreData;
  }
}

export interface MetricsRequest {
  model_id: string;
  task_type: TaskTypes;
}

export interface MetricsResponse {
  metrics_test: ClassificationMetrics | RegressionMetrics;
  metrics_train: ClassificationMetrics | RegressionMetrics;
}

export interface DownloadRequest {
  model_id: string;
}