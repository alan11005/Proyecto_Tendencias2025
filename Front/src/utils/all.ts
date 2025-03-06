export interface CsvRow {
  [key: string]: string | number;
}

export interface Message {
  message: string;
}

export enum TaskTypes {
  REGRESSION = "regression",
  CLASSIFICATION = "classification",
}

export enum EncodingTypes {
  ONE_HOT = "onehot",
  FREQUENCY = "frequency",
}

export enum FillMethodTypes {
  MEAN = "mean",
  MEDIAN = "median",
  MODE = "mode",
  CONSTANT = "constant",
}

export enum ScalerTypes {
  STANDARD = "standard",
  MINMAX = "minmax",
}