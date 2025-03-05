import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import mainReducer from "./main/mainSlice";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    main: mainReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    thunk: false,
  }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;