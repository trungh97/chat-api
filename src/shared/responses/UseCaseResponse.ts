export interface UseCaseResponse<T> {
  data: T | null;
  error?: string;
}
