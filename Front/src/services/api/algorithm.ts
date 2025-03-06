// services/api.ts
import axios, { AxiosInstance } from "axios";
import {
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

// Aquí defines la URL base de tu backend (puedes usar variable de entorno)
const API_ALGORITHM_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/app/algorithm";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    // Inicializamos la instancia de axios
    this.client = axios.create({
      baseURL: API_ALGORITHM_BASE_URL,
      // Puedes setear headers comunes, interceptores, etc.
    });
  }

  // ----------------------
  // UPLOAD DATASET
  // ----------------------
  public uploadDataset = async (
    data: UploadDatasetRequest
  ): Promise<UploadDatasetResponse> => {
    const response = await this.client.post("/upload-dataset", data);
    return response.data;
  };

  // ----------------------
  // SELECT TARGET
  // ----------------------
  public selectTarget = async (
    data: SelectTargetRequest
  ): Promise<SelectTargetResponse> => {
    const response = await this.client.post("/select-target", data);
    return response.data;
  };

  // ----------------------
  // TRAIN MODELS
  // ----------------------
  public trainModels = async (
    data: TrainModelsRequest
  ): Promise<TrainModelsResponse> => {
    const response = await this.client.post("/train", data);
    return response.data;
  };

  // ----------------------
  // GET METRICS
  // ----------------------
  public getMetrics = async (
    data: MetricsRequest
  ): Promise<MetricsResponse> => {
    const response = await this.client.post("/metrics", data);
    return response.data;
  };

  // ----------------------
  // DOWNLOAD
  // ----------------------
  public download = async (
    data: DownloadRequest
  ): Promise<Blob> => {
    const response = await this.client.post("/download", data, {
      responseType: "blob",
    });
    return response.data;
  };
}

// Exporta una instancia única (singleton) para usar en toda la app
const apiService = new ApiService();
export default apiService;
