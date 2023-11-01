export interface FieldError {
  field: string;
  message: string;
}

export type ValidationError = FieldError[];
