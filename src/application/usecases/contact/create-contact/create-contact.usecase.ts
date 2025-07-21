import {
  IContactResponseDTO,
  ICreateContactRequestDTO,
} from "@domain/dtos/contact";
import { UseCaseResponse } from "@shared/responses";
/**
 * Interface for the use case that creates a contact.
 *
 * @interface
 */
export interface ICreateContactUseCase {
  /**
   * Executes the create contact use case.
   *
   * @async
   * @param {ICreateContactRequestDTO} request - The request data.
   * @returns {Promise<UseCaseResponse<IContactResponseDTO>>} The response data.
   */
  execute(
    request: ICreateContactRequestDTO
  ): Promise<UseCaseResponse<IContactResponseDTO>>;
}
