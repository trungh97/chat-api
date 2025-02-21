import { IContactRepository } from "@domain/repositories";
import { IDeleteContactUseCase } from "@domain/usecases/contact";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class DeleteContactUseCase implements IDeleteContactUseCase {
  constructor(
    @inject(TYPES.ContactPrismaRepository)
    private contactRepository: IContactRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(id: string): Promise<UseCaseResponse<boolean>> {
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
