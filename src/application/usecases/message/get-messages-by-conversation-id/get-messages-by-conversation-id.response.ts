import { Message } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";

export type GetMessagesByConversationIdResponse = UseCaseResponse<ICursorBasedPaginationResponse<Message>>;
