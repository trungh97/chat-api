import { Participant } from "@domain/entities";
import { IParticipantRepository } from "@domain/repositories";
import { IGetParticipantByIdUseCase } from "@domain/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class GetParticipantByIdUseCase implements IGetParticipantByIdUseCase {
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    conversationId: string,
    userId: string
  ): Promise<UseCaseResponse<Participant>> {
    try {
      const response = await this.participantRepository.getParticipantById(
        conversationId,
        userId
      );
      if (response.error) {
        this.logger.error(
          `Error fetching participant: ${response.error.message}`
        );
        return { data: null, error: response.error.message };
      }
      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing get participant by ID use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing get participant by ID use case: ${error.message}`,
      };
    }
  }
}
