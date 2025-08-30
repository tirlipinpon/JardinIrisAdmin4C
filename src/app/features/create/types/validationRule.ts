export interface ValidationRule {
  value: any;
  errorMessage: string;
  validator?: (value: any) => boolean;
}
