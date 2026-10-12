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
import { UpdateParticipantLastSeenMessageRequest } from "./update-last-seen-message.request";
import { UpdateParticipantLastSeenMessageResponse } from "./update-last-seen-message.response";
import { IUpdateParticipantLastSeenMessageUseCase } from "./update-last-seen-message.usecase";

@injectable()
export class UpdateParticipantLastSeenMessageUseCase
  implements IUpdateParticipantLastSeenMessageUseCase
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
    request: UpdateParticipantLastSeenMessageRequest
  ): Promise<UpdateParticipantLastSeenMessageResponse> {
    try {
      const { conversationId, messageId } = request;

      const { data: target, error: targetError } = await resolvePointerTarget(
        this.participantRepository,
        this.messageRepository,
        request
      );

      if (targetError || !target) {
        this.logger.error(
          `[UpdateParticipantLastSeenMessageUseCase]: ${targetError}`
        );
        return { data: null, error: targetError };
      }

      const { participant, messageCreatedAt } = target;

      const { value: moved, error } =
        await this.participantRepository.updateLastSeenMessage({
          participantId: participant.id,
          messageId,
          messageCreatedAt,
        });

      if (error) {
        this.logger.error(error.message);
        return { data: null, error: error.message };
      }

      // The participant had already seen this message or a later one.
      if (!moved) return { data: false };

      const { data: recipientUserIds, error: recipientsError } =
        await getConversationRecipientUserIds(
          this.participantRepository,
          conversationId
        );

      if (recipientsError) {
        // The pointer is saved; clients catch up the next time they fetch the conversation.
        this.logger.error(
          `[UpdateParticipantLastSeenMessageUseCase]: Seen update saved but not published: ${recipientsError}`
        );
        return { data: true };
      }

      await this.messagePublisher.publishLastSeenMessageUpdated({
        conversationId,
        participantId: participant.id,
        messageId,
        messageCreatedAt,
        lastSeenAt: new Date(),
        recipientUserIds,
      });

      return { data: true };
    } catch (error) {
      this.logger.error(
        `[UpdateParticipantLastSeenMessageUseCase]: Error executing update last seen message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing update last seen message use case: ${error.message}`,
      };
    }
  }
}
