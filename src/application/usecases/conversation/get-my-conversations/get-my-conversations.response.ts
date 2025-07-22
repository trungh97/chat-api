import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";
import { ConversationUseCaseResponse } from "../types";

export type GetMyConversationsResponse = UseCaseResponse<
  ICursorBasedPaginationResponse<ConversationUseCaseResponse>
>;
