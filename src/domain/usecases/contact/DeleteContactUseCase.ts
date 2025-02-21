import { UseCaseResponse } from "@shared/responses";

/**
 * Interface for the use case that deletes a contact.
 *
 * @interface
 */
export interface IDeleteContactUseCase {
  /**
   * Deletes the contact based on the contact id.
   *
   * @async
   * @param {string} id - The contact id.
   * @returns {Promise<UseCaseResponse<boolean>>} The result of the deletion.
   */
  execute(id: string): Promise<UseCaseResponse<boolean>>;
}
