// store/index.ts

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Definición de interfaces para cada parte del estado
interface DatasetState {
  id: string | null;
  columns: string[];
  file?: File;
}

interface SelectionState {
  targetColumn: string | null;
  selectedModels: string[];
}

interface TrainResultsState {
  metrics: { [modelName: string]: any };
  bestModel: string | null;
}

interface RootState {
  dataset: DatasetState;
  selection: SelectionState;
  trainResults: TrainResultsState;
}

// Estados iniciales
const initialDatasetState: DatasetState = {
  id: null,
  columns: [],
};

const initialSelectionState: SelectionState = {
  targetColumn: null,
  selectedModels: [],
};

const initialTrainResultsState: TrainResultsState = {
  metrics: {},
  bestModel: null,
};

// Slice para el dataset
const datasetSlice = createSlice({
  name: 'dataset',
  initialState: initialDatasetState,
  reducers: {
    setDataset(
      state,
      action: PayloadAction<{ id: string; columns: string[]; file: File }>
    ) {
      state.id = action.payload.id;
      state.columns = action.payload.columns;
      state.file = action.payload.file;
    },
    clearDataset(state) {
      state.id = null;
      state.columns = [];
      state.file = undefined;
    },
  },
});

// Slice para la selección (columna objetivo y modelos)
const selectionSlice = createSlice({
  name: 'selection',
  initialState: initialSelectionState,
  reducers: {
    setTargetColumn(state, action: PayloadAction<string>) {
      state.targetColumn = action.payload;
    },
    setSelectedModels(state, action: PayloadAction<string[]>) {
      state.selectedModels = action.payload;
    },
    clearSelection(state) {
      state.targetColumn = null;
      state.selectedModels = [];
    },
  },
});

// Slice para los resultados del entrenamiento
const trainResultsSlice = createSlice({
  name: 'trainResults',
  initialState: initialTrainResultsState,
  reducers: {
    setTrainResults(
      state,
      action: PayloadAction<{ metrics: { [modelName: string]: any }; bestModel: string }>
    ) {
      state.metrics = action.payload.metrics;
      state.bestModel = action.payload.bestModel;
    },
    clearTrainResults(state) {
      state.metrics = {};
      state.bestModel = null;
    },
  },
});

// Exportamos las acciones para usarlas en los componentes
export const { setDataset, clearDataset } = datasetSlice.actions;
export const { setTargetColumn, setSelectedModels, clearSelection } = selectionSlice.actions;
export const { setTrainResults, clearTrainResults } = trainResultsSlice.actions;

// Configuramos el store uniendo todos los slices
export const store = configureStore({
  reducer: {
    dataset: datasetSlice.reducer,
    selection: selectionSlice.reducer,
    trainResults: trainResultsSlice.reducer,
  },
});

// Tipos de TypeScript para el estado y dispatch
export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
