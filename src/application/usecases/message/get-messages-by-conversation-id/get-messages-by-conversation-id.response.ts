import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";
import { IMessageUseCaseDTO } from "../types";

export type GetMessagesByConversationIdResponse = UseCaseResponse<
  ICursorBasedPaginationResponse<IMessageUseCaseDTO>
>;
