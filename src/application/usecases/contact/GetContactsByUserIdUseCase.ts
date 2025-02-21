import { IContactResponseDTO } from "@domain/dtos/contact";
import { IContactRepository, IUserRepository } from "@domain/repositories";
import { IGetContactsByUserIdUseCase } from "@domain/usecases/contact";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
class GetContactsByUserIdUseCase implements IGetContactsByUserIdUseCase {
  constructor(
    @inject(TYPES.ContactPrismaRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.UserPrismaRepository)
    private userRepository: IUserRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    userId: string
  ): Promise<UseCaseResponse<IContactResponseDTO[]>> {
    try {
      const result = await this.contactRepository.getContactsByUserId(userId);

      if (result.error) {
        return {
          data: null,
          error: result.error.message,
        };
      }

      const contactIds = result.value.map((contact) => contact.contactId);
      const contactNamesResult = await this.userRepository.getUserNamesByIds(
        contactIds
      );

      const contactNameList = new Map(
        contactNamesResult.value.map(({ id, firstName, lastName }) => [
          id,
          `${firstName} ${lastName}`.trim(),
        ])
      );

      const data = result.value.map(({ id, contactId, userId }) => {
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

export { GetContactsByUserIdUseCase };

