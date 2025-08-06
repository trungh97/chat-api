import { IContactRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { DeleteContactResponse } from "./delete-contact.response";
import { IDeleteContactUseCase } from "./delete-contact.usecase";

@injectable()
export class DeleteContactUseCase implements IDeleteContactUseCase {
  constructor(
    @inject(TYPES.ContactPrismaRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<DeleteContactResponse> {
    try {
      const result = await this.contactRepository.deleteContact(id);

      if (result.error) {
        return {
          data: false,
          error: result.error.message,
        };
      }

      return {
        data: true,
      };
    } catch (error) {
      this.logger.error(
        `Error executing delete contact use case: ${error.message}`
      );
      return {
        data: false,
        error: `Error executing delete contact use case: ${error.message}`,
      };
    }
  }
}
