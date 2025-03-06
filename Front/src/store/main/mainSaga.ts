import { 
  call, 
  put, 
  takeLatest,
  takeEvery,
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
  downloadRequest,
  downloadSuccess,
  downloadFailure,
} from './mainSlice';
import apiService from '@/services/api/algorithm';
import type {
  UploadDatasetRequest,
  UploadDatasetResponse,
  SelectTargetRequest,
  SelectTargetResponse,
  TrainModelsRequest,
  TrainModelsResponse,
  MetricsRequest,
  MetricsResponse,
  DownloadRequest,
} from '@/utils/types/api/algorithm';

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

function* getMetrics(action: PayloadAction<MetricsRequest & {
  model_name: string
}>) {
  try {
    const response: MetricsResponse = yield call(apiService.getMetrics, action.payload);
    yield put(metricsSuccess({
      ...response,
      model_name: action.payload.model_name,
      model_id: action.payload.model_id,
    }));
  } catch (error) {
    yield put(metricsFailure('Error getting metrics'));
  }
}

function* download(action: PayloadAction<DownloadRequest>) {
  try {
    const response: Blob = yield call(apiService.download, action.payload);

    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'model.pkl');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    yield put(downloadSuccess());
  } catch (error) {
    yield put(downloadFailure('Error downloading file'));
  }
}

export default function* mainSaga() {
  yield all([
    takeLatest(uploadDatasetRequest.type, uploadDataset),
    takeLatest(selectTargetRequest.type, selectTarget),
    takeLatest(trainModelsRequest.type, trainModels),
    takeEvery(metricsRequest.type, getMetrics),
    takeEvery(downloadRequest.type, download),
  ]);
}