import { Participant } from "@domain/entities";
import { ConversationType, ParticipantType } from "@domain/enums";
import {
  IConversationRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { ICreateParticipantUseCase } from "@domain/usecases/participant";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class CreateParticipantUseCase implements ICreateParticipantUseCase {
  constructor(
    @inject(TYPES.ParticipantPrismaRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    participantRequest: Participant,
    currentUserId: string
  ): Promise<UseCaseResponse<Participant>> {
    try {
      // check if the conversation existed
      const { value: conversation, error: conversationError } =
        await this.conversationRepository.getConversationById(
          participantRequest.conversationId
        );

      if (conversationError || !conversation.id) {
        this.logger.error(
          `Error getting conversation: ${conversationError.message}`
        );
        return { data: null, error: conversationError.message };
      }

      // check if the conversation is a group conversation
      if (conversation.type !== ConversationType.GROUP) {
        this.logger.error(
          `Conversation ${participantRequest.conversationId} is not a group conversation`
        );
        return {
          data: null,
          error: `Conversation ${participantRequest.conversationId} is not a group conversation`,
        };
      }

      // check if the current user is a member of the conversation
      const conversationParticipants =
        await this.participantRepository.getParticipantsByConversationId(
          participantRequest.conversationId
        );

      if (conversationParticipants.error || !conversationParticipants.value) {
        this.logger.error(
          `Error getting participants: ${conversationParticipants.error.message}`
        );
        return { data: null, error: "Error creating participant" };
      }

      const isConversationMember = conversationParticipants.value.find(
        (participant) => participant.userId === currentUserId
      );

      if (!isConversationMember) {
        this.logger.error(
          `User ${currentUserId} is not authorized to create a participant for conversation ${participantRequest.conversationId}`
        );
        return {
          data: null,
          error: `User ${currentUserId} is not authorized to create a participant for conversation ${participantRequest.conversationId}`,
        };
      }

      // check if the participant already existed
      const existingParticipant = conversationParticipants.value.find(
        (p) => p.userId === participantRequest.userId
      );

      if (existingParticipant) {
        this.logger.error(
          `Participant ${participantRequest.userId} already exists in conversation ${participantRequest.conversationId}`
        );
        return {
          data: null,
          error: `Participant ${participantRequest.userId} already exists in conversation ${participantRequest.conversationId}`,
        };
      }

      const response = await this.participantRepository.createParticipant(
        participantRequest
      );
      if (response.error) {
        this.logger.error(
          `Error creating participant: ${response.error.message}`
        );
        return { data: null, error: response.error.message };
      }
      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing create participant use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing create participant use case: ${error.message}`,
      };
    }
  }
}
