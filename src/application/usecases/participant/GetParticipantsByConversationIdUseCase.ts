import { Participant } from "@domain/entities";
import { IParticipantRepository } from "@domain/repositories";
import { IGetParticipantsByConversationIdUseCase } from "@domain/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class GetParticipantsByConversationIdUseCase
  implements IGetParticipantsByConversationIdUseCase
{
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    conversationId: string,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant[]>> {
    try {
      // Check if the current user is a member of the conversation
      const { value: participant, error: participantError } =
        await this.participantRepository.getParticipantById(
          conversationId,
          currentUserId
        );

      if (participantError || !participant.id) {
        this.logger.error(
          `Error getting participant: ${participantError.message}`
        );
        return { data: null, error: participantError.message };
      }

      const response =
        await this.participantRepository.getParticipantsByConversationId(
          conversationId
        );

      if (response.error) {
        this.logger.error(
          `Error fetching participants for conversation ${conversationId}: ${response.error.message}`
        );
        return { data: null, error: response.error.message };
      }
      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing get participants by conversation ID use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing get participants by conversation ID use case: ${error.message}`,
      };
    }
  }
}
