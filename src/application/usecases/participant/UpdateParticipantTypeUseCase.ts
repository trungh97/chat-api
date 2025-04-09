import { Participant } from "@domain/entities";
import { ParticipantType } from "@domain/enums";
import { IParticipantRepository } from "@domain/repositories";
import { IUpdateParticipantTypeUseCase } from "@domain/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateParticipantTypeUseCase
  implements IUpdateParticipantTypeUseCase
{
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    conversationId: string,
    userId: string,
    type: string,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>> {
    try {
      // Check if the current user is an admin of the conversation
      const { value: participant, error: participantError } =
        await this.participantRepository.getParticipantById(
          conversationId,
          currentUserId
        );

      if (
        participantError ||
        !participant.id ||
        participant.type !== ParticipantType.ADMIN
      ) {
        this.logger.error(
          `Error getting participant: ${participantError.message}`
        );
        return {
          data: null,
          error: "You do not have the right to update the participant type",
        };
      }

      const response = await this.participantRepository.updateParticipantType(
        conversationId,
        userId,
        type
      );

      if (response.error) {
        this.logger.error(
          `Error updating participant type: ${response.error.message}`
        );
        return { data: null, error: response.error.message };
      }
      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing update participant type use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing update participant type use case: ${error.message}`,
      };
    }
  }
}
