import { IParticipantRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { GetParticipantByIdResponse } from "./get-participant-by-id.response";
import { IGetParticipantByIdUseCase } from "./get-participant-by-id.usecase";
import { GetParticipantByIdRequest } from "./get-participant-by-id.request";

@injectable()
export class GetParticipantByIdUseCase implements IGetParticipantByIdUseCase {
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    conversationId,
    userId,
  }: GetParticipantByIdRequest): Promise<GetParticipantByIdResponse> {
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
