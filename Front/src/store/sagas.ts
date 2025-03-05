import { all, fork } from 'redux-saga/effects';
import mainSaga from './main/mainSaga';

export default function* rootSaga() {
  yield all([fork(mainSaga)]);
}