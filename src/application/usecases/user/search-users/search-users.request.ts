import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";

export type SearchUsersRequest = {
  /** The caller. They are never part of the results. */
  userId: string;
  search?: string;
  pagination: ICursorBasedPaginationParams;
};
