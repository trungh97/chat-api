export interface OffsetBasedPaginationParams {
  page: number;
  limit: number;
}

export interface OffsetBasedPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
