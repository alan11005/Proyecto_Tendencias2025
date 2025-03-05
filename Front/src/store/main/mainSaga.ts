import { 
  call, 
  put, 
  takeLatest, 
  all 
} from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
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
  predictRequest,
  predictSuccess,
  predictFailure,
} from './mainSlice';
import apiService from '@/services/api';
import type {
  UploadDatasetRequest,
  UploadDatasetResponse,
  SelectTargetRequest,
  SelectTargetResponse,
  TrainModelsRequest,
  TrainModelsResponse,
  MetricsRequest,
  MetricsResponse,
  PredictRequest,
  PredictResponse,
} from '@/utils/api';

function* uploadDataset(action: PayloadAction<UploadDatasetRequest>) {
  try {
    const response: UploadDatasetResponse = yield call(apiService.uploadDataset, action.payload);
    yield put(uploadDatasetSuccess(response));
  } catch (error) {
    yield put(uploadDatasetFailure('Error uploading dataset'));
  }
}

function* selectTarget(action: PayloadAction<SelectTargetRequest>) {
  try {
    const response: SelectTargetResponse = yield call(apiService.selectTarget, action.payload);
    yield put(selectTargetSuccess(response));
  } catch (error) {
    yield put(selectTargetFailure('Error selecting target'));
  }
}

function* trainModels(action: PayloadAction<TrainModelsRequest>) {
  try {
    const response: TrainModelsResponse = yield call(apiService.trainModels, action.payload);
    yield put(trainModelsSuccess(response));
  } catch (error) {
    yield put(trainModelsFailure('Error training models'));
  }
}

function* getMetrics(action: PayloadAction<MetricsRequest>) {
  try {
    const response: MetricsResponse = yield call(apiService.getMetrics, action.payload);
    yield put(metricsSuccess(response));
  } catch (error) {
    yield put(metricsFailure('Error getting metrics'));
  }
}

function* predict(action: PayloadAction<PredictRequest>) {
  try {
    const response: PredictResponse = yield call(apiService.predict, action.payload);
    yield put(predictSuccess(response));
  } catch (error) {
    yield put(predictFailure('Error predicting'));
  }
}

export default function* mainSaga() {
  yield all([
    takeLatest(uploadDatasetRequest.type, uploadDataset),
    takeLatest(selectTargetRequest.type, selectTarget),
    takeLatest(trainModelsRequest.type, trainModels),
    takeLatest(metricsRequest.type, getMetrics),
    takeLatest(predictRequest.type, predict),
  ]);
}