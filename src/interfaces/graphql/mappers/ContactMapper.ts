import { IContactResponseDTO } from "@application/usecases/contact/types";
import { Contact } from "@domain/entities";
import { ContactDTO } from "../dtos";

/**
 * Mapper class for converting between Contact entities and ContactDTOs.
 */
export class ContactMapper {
  /**
   * Converts a Contact entity to a ContactDTO.
   *
   * @param {Contact} contact - The Contact entity to be converted.
   * @returns {ContactDTO} - The resulting ContactDTO.
   */
  static toDTO(contact: IContactResponseDTO): ContactDTO {
    return contact;
  }

  /**
   * Converts a ContactDTO to a Contact entity.
   *
   * @param {ContactDTO} contactDTO - The ContactDTO to be converted.
   * @returns {Contact} - The resulting Contact entity.
   */
  static toEntity(contactDTO: ContactDTO): Contact {
    const contact = {
      id: contactDTO.id,
      userId: contactDTO.userId,
      contactId: contactDTO.contactId,
    };
    return new Contact(contact);
  }
}
