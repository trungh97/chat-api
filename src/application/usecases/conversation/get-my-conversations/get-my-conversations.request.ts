import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";

export type GetMyConversationsRequest = {
  userId: string;
  pagination: ICursorBasedPaginationParams;
};
