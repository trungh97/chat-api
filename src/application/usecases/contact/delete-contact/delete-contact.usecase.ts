import { DeleteContactResponse } from "./delete-contact.response";

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
   * @returns {Promise<DeleteContactResponse>} The result of the deletion.
   */
  execute(id: string): Promise<DeleteContactResponse>;
}
