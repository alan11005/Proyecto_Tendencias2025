import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  EncodingTypes,
  FillMethodTypes,
  ScalerTypes,
} from "@/utils/all";
import {
  ApplyEncodingRequest,
  ApplyEncodingResponse,
  ApplyScalingRequest,
  ApplyScalingResponse,
  DetectMissingResponse,
  FillNullsRequest,
  FillNullsResponse,
} from "@/utils/types/api/preprocess";

interface PreprocessState {
  missingValues: {
    [key: string]: number;
  };
  detectMissingRequesting: boolean;
  detectMissingSuccess: boolean;
  detectMissingError: string;
  fillNullsRequesting: boolean;
  fillNullsSuccess: boolean;
  fillNullsError: string;
  applyEncodingRequesting: boolean;
  applyEncodingSuccess: boolean;
  applyEncodingError: string;
  applyScalingRequesting: boolean;
  applyScalingSuccess: boolean;
  applyScalingError: string; 
}

const initialState: PreprocessState = {
  missingValues: {},
  detectMissingRequesting: false,
  detectMissingSuccess: false,
  detectMissingError: "",
  fillNullsRequesting: false,
  fillNullsSuccess: false,
  fillNullsError: "",
  applyEncodingRequesting: false,
  applyEncodingSuccess: false,
  applyEncodingError: "",
  applyScalingRequesting: false,
  applyScalingSuccess: false,
  applyScalingError: "",
};

export const preprocessSlice = createSlice({
  name: "preprocess",
  initialState,
  reducers: {
    // -------------------------------
    // DETECT MISSING
    // -------------------------------
    detectMissingRequest: (state) => {
      state.detectMissingRequesting = true;
      state.detectMissingSuccess = false;
      state.detectMissingError = "";
    },
    detectMissingSuccess: (state, action: PayloadAction<DetectMissingResponse>) => {
      state.missingValues = action.payload.missing_values;
      state.detectMissingRequesting = false;
      state.detectMissingSuccess = true;
      state.detectMissingError = "";
    },
    detectMissingError: (state, action: PayloadAction<string>) => {
      state.detectMissingRequesting = false;
      state.detectMissingSuccess = false;
      state.detectMissingError = action.payload;
    },
    // -------------------------------
    // FILL NULLS
    // -------------------------------
    fillNullsRequest: (state, action: PayloadAction<FillNullsRequest>) => {
      state.fillNullsRequesting = true;
      state.fillNullsSuccess = false;
      state.fillNullsError = "";
    },
    fillNullsSuccess: (state, action: PayloadAction<FillNullsResponse>) => {
      state.fillNullsRequesting = false;
      state.fillNullsSuccess = true;
      state.fillNullsError = "";
    },
    fillNullsError: (state, action: PayloadAction<string>) => {
      state.fillNullsRequesting = false;
      state.fillNullsSuccess = false;
      state.fillNullsError = action.payload;
    },
    // -------------------------------
    // APPLY ENCODING
    // -------------------------------
    applyEncodingRequest: (state, action: PayloadAction<ApplyEncodingRequest>) => {
      state.applyEncodingRequesting = true;
      state.applyEncodingSuccess = false;
      state.applyEncodingError = "";
    },
    applyEncodingSuccess: (state, action: PayloadAction<ApplyEncodingResponse>) => {
      state.applyEncodingRequesting = false;
      state.applyEncodingSuccess = true;
      state.applyEncodingError = "";
    },
    applyEncodingError: (state, action: PayloadAction<string>) => {
      state.applyEncodingRequesting = false;
      state.applyEncodingSuccess = false;
      state.applyEncodingError = action.payload;
    },
    // -------------------------------
    // APPLY SCALING
    // -------------------------------
    applyScalingRequest: (state, action: PayloadAction<ApplyScalingRequest>) => {
      state.applyScalingRequesting = true;
      state.applyScalingSuccess = false;
      state.applyScalingError = "";
    },
    applyScalingSuccess: (state, action: PayloadAction<ApplyScalingResponse>) => {
      state.applyScalingRequesting = false;
      state.applyScalingSuccess = true;
      state.applyScalingError = "";
    },
    applyScalingError: (state, action: PayloadAction<string>) => {
      state.applyScalingRequesting = false;
      state.applyScalingSuccess = false;
      state.applyScalingError = action.payload;
    },
  },
});

export const {
  detectMissingRequest,
  detectMissingSuccess,
  detectMissingError,
  fillNullsRequest,
  fillNullsSuccess,
  fillNullsError,
  applyEncodingRequest,
  applyEncodingSuccess,
  applyEncodingError,
  applyScalingRequest,
  applyScalingSuccess,
  applyScalingError,
} = preprocessSlice.actions;

export default preprocessSlice.reducer;