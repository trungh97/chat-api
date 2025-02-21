import { Contact } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export interface IFindContactByIdUseCase {
  /**
   * Executes the find contact by id use case.
   *
   * @async
   * @param {string} id - The contact id
   * @returns {Promise<UseCaseResponse<Contact>>} The contact's information
   */
  execute(id: string): Promise<UseCaseResponse<Contact>>;
}
