import { Contact } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { RepositoryResponse } from "@shared/responses";

export interface IContactRepository {
  /**
   * Retrieves the contact's information based on the contact id.
   *
   * @async
   * @param {string} id - The contact id.
   * @returns {Promise<RepositoryResponse<Contact, Error>>} The contact's information.
   */
  getContactById(id: string): Promise<RepositoryResponse<Contact, Error>>;

  /**
   * Retrieves the contact's information based on the user id and the contact id.
   *
   * @async
   * @param {string} userId - The user id.
   * @param {string} contactId - The contact id.
   * @returns {Promise<RepositoryResponse<Contact, Error>>} The contact's information.
   */
  getContactByUserIdAndContactId(
    userId: string,
    contactId: string
  ): Promise<RepositoryResponse<Contact, Error>>;

  /**
   * Retrieves the contacts' information based on the user id.
   *
   * @async
   * @param {string} userId - The user id.
   * @returns {Promise<RepositoryResponse<ICursorBasedPaginationResponse<Contact>, Error>>} The contacts' information.
   */
  getContactsByUserId(
    userId: string,
    cursor?: string,
    limit?: number
  ): Promise<
    RepositoryResponse<ICursorBasedPaginationResponse<Contact>, Error>
  >;

  /**
   * Creates a new contact.
   *
   * @async
   * @param {Contact} contact - The new contact.
   * @returns {Promise<RepositoryResponse<Contact, Error>>} The new contact.
   */
  createContact(contact: Contact): Promise<RepositoryResponse<Contact, Error>>;

  /**
   * Updates the contact's information.
   *
   * @async
   * @param {Contact} contact - The contact to update.
   * @returns {Promise<RepositoryResponse<Contact, Error>>} The updated contact.
   */
  updateContact(contact: Contact): Promise<RepositoryResponse<Contact, Error>>;

  /**
   * Deletes the contact based on the contact id.
   *
   * @async
   * @param {string} id - The contact id.
   * @returns {Promise<RepositoryResponse<boolean, Error>>} The result of the deletion.
   */
  deleteContact(id: string): Promise<RepositoryResponse<boolean, Error>>;
}
