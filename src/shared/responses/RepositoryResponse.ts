export interface RepositoryResponse<T, E> {
  success: boolean;
  value: T;
  error?: E;
}
