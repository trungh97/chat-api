import { IContactRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { FindContactByIdResponse } from "./find-contact-by-id.response";
import { IFindContactByIdUseCase } from "./find-contact-by-id.usecase";

@injectable()
export class FindContactByIdUseCase implements IFindContactByIdUseCase {
  constructor(
    @inject(TYPES.ContactPrismaRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<FindContactByIdResponse> {
    try {
      const result = await this.contactRepository.getContactById(id);

      if (!result.value || result.error) {
        return {
          data: null,
          error: result.error.message || `Contact with id ${id} not found`,
        };
      }

      return {
        data: result.value,
      };
    } catch (error) {
      this.logger.error(
        `Error executing find contact by id use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing find contact by id use case: ${error.message}`,
      };
    }
  }
}
