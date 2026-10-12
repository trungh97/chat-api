import { IMessageEventPublisher } from "@domain/events";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import {
  getConversationRecipientUserIds,
  resolvePointerTarget,
} from "../pointer-target";
import { UpdateParticipantLastReceivedMessageRequest } from "./update-last-received-message.request";
import { UpdateParticipantLastReceivedMessageResponse } from "./update-last-received-message.response";
import { IUpdateParticipantLastReceivedMessageUseCase } from "./update-last-received-message.usecase";

@injectable()
export class UpdateParticipantLastReceivedMessageUseCase
  implements IUpdateParticipantLastReceivedMessageUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private participantRepository: IParticipantRepository,

    @inject(TYPES.MessageRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.MessagePublisher)
    private messagePublisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    request: UpdateParticipantLastReceivedMessageRequest
  ): Promise<UpdateParticipantLastReceivedMessageResponse> {
    try {
      const { conversationId, messageId } = request;

      const { data: target, error: targetError } = await resolvePointerTarget(
        this.participantRepository,
        this.messageRepository,
        request
      );

      if (targetError || !target) {
        this.logger.error(
          `[UpdateParticipantLastReceivedMessageUseCase]: ${targetError}`
        );
        return { data: null, error: targetError };
      }

      const { participant, messageCreatedAt } = target;

      const { value: moved, error } =
        await this.participantRepository.updateLastReceivedMessage({
          participantId: participant.id,
          messageId,
          messageCreatedAt,
        });

      if (error) {
        this.logger.error(error.message);
        return { data: null, error: error.message };
      }

      // The participant had already received this message or a later one.
      if (!moved) return { data: false };

      const { data: recipientUserIds, error: recipientsError } =
        await getConversationRecipientUserIds(
          this.participantRepository,
          conversationId
        );

      if (recipientsError) {
        // The pointer is saved; clients catch up the next time they fetch the conversation.
        this.logger.error(
          `[UpdateParticipantLastReceivedMessageUseCase]: Received update saved but not published: ${recipientsError}`
        );
        return { data: true };
      }

      // Publish event to notify back to the client about the update
      await this.messagePublisher.publishLastReceivedMessageUpdated({
        recipientUserIds,
        updates: [
          {
            conversationId,
            participantId: participant.id,
            messageId,
            messageCreatedAt,
          },
        ],
      });

      return { data: true };
    } catch (error) {
      this.logger.error(
        `[UpdateParticipantLastReceivedMessageUseCase]: Error executing update last received message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing update last received message use case: ${error.message}`,
      };
    }
  }
}
