import { IContactResponseDTO } from "@domain/dtos/contact";
import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that retrieves the contacts' information based on the user id.
 *
 * @interface
 */
export interface IGetContactsByUserIdUseCase {
  /**
   * Executes the get contacts by user id use case.
   *
   * @async
   * @param {string} userId - The user id.
   * @returns {Promise<UseCaseResponse<IContactResponseDTO[]>>} The contacts' information.
   */
  execute(userId: string): Promise<UseCaseResponse<IContactResponseDTO[]>>;
}
