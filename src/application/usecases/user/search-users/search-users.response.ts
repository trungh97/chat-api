import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";

export type SearchUsersItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  isOnline: boolean;
};

export type SearchUsersResponse = UseCaseResponse<
  ICursorBasedPaginationResponse<SearchUsersItem>
>;
