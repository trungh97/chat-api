export interface ICursorBasedPaginationParams {
  limit: number;
  cursor?: string;
}

export interface ICursorBasedPaginationResponse<T> {
  data: T[];
  nextCursor?: string;
}