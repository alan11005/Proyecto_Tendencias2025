import { EncodingTypes, ScalerTypes, FillMethodTypes } from "@/utils/all";
import { Message } from "@/utils/all";

export interface DetectMissingResponse {
  missing_values: {
    [key: string]: number;
  };
}

export interface FillNullsRequest {
  columns: {
    column: string;
    fill_method: FillMethodTypes;
    fill_value?: string;
  }[];
}

export interface FillNullsResponse extends Message {}

export interface ApplyEncodingRequest {
  columns: string[];
  encoding_type: EncodingTypes;
}

export interface ApplyEncodingResponse extends Message {}

export interface ApplyScalingRequest {
  columns: string[];
  scaler_type: ScalerTypes;
}

export interface ApplyScalingResponse extends Message {}