import { ParticipantType } from "@domain/enums";
import {
  IConversationRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { DeleteParticipantByIdResponse } from "./delete-participant-by-id.response";
import { IDeleteParticipantByIdUseCase } from "./delete-participant-by-id.usecase";
import { DeleteParticipantByIdRequest } from "./delete-participant-by-id.request";

@injectable()
export class DeleteParticipantByIdUseCase
  implements IDeleteParticipantByIdUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.ConversationRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute({
    conversationId,
    id,
    currentUserId,
  }: DeleteParticipantByIdRequest): Promise<DeleteParticipantByIdResponse> {
    try {
      // check if the current user is an admin of the conversation
      const {
        value: { conversation, participants: conversationParticipants },
        error: conversationError,
      } = await this.conversationRepository.getConversationById(conversationId);

      if (conversationError || !conversation.id) {
        this.logger.error(
          `Error getting conversation: ${conversationError.message}`
        );
        return {
          data: null,
          error: "Failed to delete participant from this conversation!",
        };
      }

      const isAdmin = conversationParticipants.find(
        (participant) =>
          participant.userId === currentUserId &&
          participant.type === ParticipantType.ADMIN
      );

      if (!isAdmin) {
        this.logger.error(
          `User ${currentUserId} is not an admin of conversation ${conversationId}`
        );
        return {
          data: null,
          error:
            "You do not have the right to delete the participant from this conversation!",
        };
      }

      const response = await this.participantRepository.deleteParticipantById(
        id
      );
      if (response.error) {
        this.logger.error(
          `Error deleting participant with id ${id}: ${response.error.message}`
        );
        return { data: false, error: response.error.message };
      }
      return { data: response.value, error: response.error.message };
    } catch (error) {
      this.logger.error(
        `Error executing delete participant by ID use case: ${error.message}`
      );
      return {
        data: false,
        error: `Error executing delete participant by ID use case: ${error.message}`,
      };
    }
  }
}
