import { Contact } from "@domain/entities";
import { IContactRepository, IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";
import { ICreateContactRequestDTO } from "./create-contact.request";
import { IContactResponseDTO } from "./create-contact.response";
import { ICreateContactUseCase } from "./create-contact.usecase";

@injectable()
class CreateContactUseCase implements ICreateContactUseCase {
  constructor(
    @inject(TYPES.ContactPrismaRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.UserPrismaRepository)
    private userRepository: IUserRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: ICreateContactRequestDTO
  ): Promise<UseCaseResponse<IContactResponseDTO>> {
    try {
      const { userId, contactId } = request;
      // check if the contact already exists
      const existingContact =
        await this.contactRepository.getContactByUserIdAndContactId(
          userId,
          contactId
        );

      if (existingContact.value) {
        return {
          data: null,
          error: "This contact is existed!",
        };
      }

      const newContact = await Contact.create(request);
      const result = await this.contactRepository.createContact(newContact);

      if (result.error) {
        this.logger.error(result.error.message);
        return {
          data: null,
          error: result.error.message,
        };
      }

      const contactNameResult = await this.userRepository.getUserNamesByIds([
        result.value.contactId,
      ]);

      let contactName = "";

      if (contactNameResult.value[0].id) {
        contactName = `${contactNameResult.value[0].firstName} ${contactNameResult.value[0].lastName}`;
      }

      const data = new IContactResponseDTO({
        id: result.value.id,
        contactId: result.value.contactId,
        userId: result.value.userId,
        contactName,
      });

      return {
        data,
      };
    } catch (error) {
      this.logger.error(
        `Error executing create contact use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing create contact use case: ${error.message}`,
      };
    }
  }
}

export { CreateContactUseCase };
