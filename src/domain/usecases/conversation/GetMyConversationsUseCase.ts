import { IConversationResponseDTO } from "@domain/dtos/conversation";
import {
  ICursorBasedPaginationParams,
  ICursorBasedPaginationResponse,
} from "@domain/interfaces/pagination/CursorBasedPagination";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves the current user's conversations.
 *
 * @interface
 */
export interface IGetMyConversationsUsecase {
  /**
   * Executes the get the current user's conversations use case.
   *
   * @async
   * @param {string} userId - The ID of the user.
   * @param {ICursorBasedPaginationParams} pagination - The pagination parameters.
   * @returns {Promise<UseCaseResponse<CursorBasedPaginationResponse<IConversationResponseDTO>>>} The response data.
   */
  execute(
    userId: string,
    pagination: ICursorBasedPaginationParams
  ): Promise<UseCaseResponse<ICursorBasedPaginationResponse<IConversationResponseDTO>>>;
}
