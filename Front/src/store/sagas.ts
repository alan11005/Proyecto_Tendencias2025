import { all, fork } from 'redux-saga/effects';
import mainSaga from './main/mainSaga';
import preprocessSaga from './preprocess/preprocessSaga';

export default function* rootSaga() {
  yield all([
    fork(mainSaga),
    fork(preprocessSaga),
  ]);
}