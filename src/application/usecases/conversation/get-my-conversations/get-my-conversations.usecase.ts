import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import { GetMyConversationsResponse } from "./get-my-conversations.response";

export interface IGetMyConversationsUsecase {
  execute(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<GetMyConversationsResponse>;
}
