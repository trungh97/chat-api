import { IContactRepository, IUserRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetContactsByUserIdResponse } from "./get-contacts-by-user-id.response";
import { IGetContactsByUserIdUseCase } from "./get-contacts-by-user-id.usecase";
import { IContactResponseDTO } from "../types";

@injectable()
export class GetContactsByUserIdUseCase implements IGetContactsByUserIdUseCase {
  constructor(
    @inject(TYPES.ContactRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.UserRepository)
    private userRepository: IUserRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(userId: string): Promise<GetContactsByUserIdResponse> {
    try {
      const result = await this.contactRepository.getContactsByUserId(userId);

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }

      const contactIds = result.value.data.map((contact) => contact.contactId);
      const contactNamesResult = await this.userRepository.getUserNamesByIds(
        contactIds
      );

      const contactNameList = new Map(
        contactNamesResult.value.map(({ id, firstName, lastName }) => [
          id,
          `${firstName} ${lastName}`.trim(),
        ])
      );

      const data = result.value.data.map(({ id, contactId, userId }) => {
        const contactData = new IContactResponseDTO({
          id,
          contactId,
          userId,
          contactName: contactNameList.get(contactId) || "Unknown",
        });
        return contactData;
      });

      return {
        data,
      };
    } catch (error) {
      this.logger.error(
        `Error executing get contacts by user id use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing get contacts by user id use case: ${error.message}`,
      };
    }
  }
}
