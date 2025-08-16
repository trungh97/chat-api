import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";
import { MessageWithSenderUseCaseDTO } from "../types";

export type GetMessagesByConversationIdResponse = UseCaseResponse<
  ICursorBasedPaginationResponse<MessageWithSenderUseCaseDTO>
>;
