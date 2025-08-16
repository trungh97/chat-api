import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";
import { IMessageWithSenderUseCaseDTO } from "../types";

export type GetMessagesByConversationIdResponse = UseCaseResponse<
  ICursorBasedPaginationResponse<IMessageWithSenderUseCaseDTO>
>;
