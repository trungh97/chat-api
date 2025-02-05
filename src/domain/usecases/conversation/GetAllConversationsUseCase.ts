import { Conversation } from "@domain/entities";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves all conversations.
 *
 * @interface
 */
export interface IGetAllConversationsUsecase {
  /**
   * Executes the get all conversations use case.
   *
   * @async
   * @returns {Promise<UseCaseResponse<CursorBasedPaginationResponse<Conversation>>>} The response data.
   */
  execute(
    params: ICursorBasedPaginationParams
  ): Promise<UseCaseResponse<ICursorBasedPaginationResponse<Conversation>>>;
}
