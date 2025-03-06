import { 
  call, 
  put, 
  takeLatest,
  all,
} from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './preprocessSlice';
import apiService from '@/services/api/preprocess';
import type {
  DetectMissingResponse,
  FillNullsRequest,
  FillNullsResponse,
  ApplyEncodingRequest,
  ApplyEncodingResponse,
  ApplyScalingRequest,
  ApplyScalingResponse,
} from '@/utils/types/api/preprocess';

function* detectMissing() {
  try {
    const response: DetectMissingResponse = yield call(apiService.detectMissing);
    yield put(detectMissingSuccess(response));
  } catch (error) {
    yield put(detectMissingError('Error detecting missing values'));
  }
}

function* fillNulls(action: PayloadAction<FillNullsRequest>) {
  try {
    const response: FillNullsResponse = yield call(apiService.fillNulls, action.payload);
    yield put(fillNullsSuccess(response));
  } catch (error) {
    yield put(fillNullsError('Error filling nulls'));
  }
}

function* applyEncoding(action: PayloadAction<ApplyEncodingRequest>) {
  try {
    const response: ApplyEncodingResponse = yield call(apiService.applyEncoding, action.payload);
    yield put(applyEncodingSuccess(response));
  } catch (error) {
    yield put(applyEncodingError('Error applying encoding'));
  }
}

function* applyScaling(action: PayloadAction<ApplyScalingRequest>) {
  try {
    const response: ApplyScalingResponse = yield call(apiService.applyScaling, action.payload);
    yield put(applyScalingSuccess(response));
  } catch (error) {
    yield put(applyScalingError('Error applying scaling'));
  }
}

export default function* preprocessSaga() {
  yield all([
    takeLatest(detectMissingRequest.type, detectMissing),
    takeLatest(fillNullsRequest.type, fillNulls),
    takeLatest(applyEncodingRequest.type, applyEncoding),
    takeLatest(applyScalingRequest.type, applyScaling),
  ]);
}
