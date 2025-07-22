import { ICreateContactRequestDTO } from "./create-contact.request";
import { CreateContactResponse } from "./create-contact.response";
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
   * @returns {Promise<CreateContactResponse>} The response data.
   */
  execute(
    request: ICreateContactRequestDTO
  ): Promise<CreateContactResponse>;
}
