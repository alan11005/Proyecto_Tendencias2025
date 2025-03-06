// services/api.ts
import axios, { AxiosInstance } from "axios";
import {
  DetectMissingResponse,
  FillNullsRequest,
  FillNullsResponse,
  ApplyEncodingRequest,
  ApplyEncodingResponse,
  ApplyScalingRequest,
  ApplyScalingResponse,
} from "@/utils/types/api/preprocess";

// Aquí defines la URL base de tu backend (puedes usar variable de entorno)
const API_PREPROCESS_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/app/preprocessing";

class PreprocessApiService {
  private client: AxiosInstance;

  constructor() {
    // Inicializamos la instancia de axios
    this.client = axios.create({
      baseURL: API_PREPROCESS_BASE_URL,
      // Puedes setear headers comunes, interceptores, etc.
    });
  }

  // ----------------------
  // DETECT MISSING
  // ----------------------
  public detectMissing = async (): Promise<DetectMissingResponse> => {
    const response = await this.client.get("/detect-missing-values");
    return response.data;
  };

  // ----------------------
  // FILL NULLS
  // ----------------------
  public fillNulls = async (data: FillNullsRequest): Promise<FillNullsResponse> => {
    const response = await this.client.post("/fill-nan", data);
    return response.data;
  };

  // ----------------------
  // APPLY ENCODING
  // ----------------------
  public applyEncoding = async (data: ApplyEncodingRequest): Promise<ApplyEncodingResponse> => {
    const response = await this.client.post("/apply-encoding", data);
    return response.data;
  };

  // ----------------------
  // APPLY SCALING
  // ----------------------
  public applyScaling = async (data: ApplyScalingRequest): Promise<ApplyScalingResponse> => {
    const response = await this.client.post("/apply-scaling", data);
    return response.data;
  };

}

// Exporta una instancia única (singleton) para usar en toda la app
const preprocessApiService = new PreprocessApiService();
export default preprocessApiService;
