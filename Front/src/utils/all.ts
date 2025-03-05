export interface CsvRow {
  [key: string]: string | number;
}

export enum TaskTypes {
  REGRESSION = "regression",
  CLASSIFICATION = "classification",
}