import { IParticipantPointerUpdateDTO } from "@domain/dtos";
import {
  IMessageEventPublisher,
  PublishLastMessageReceivedPayload,
} from "@domain/events";
import {
  IMessageRepository,
  IParticipantRepository,
} from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import groupBy from "lodash/groupBy";
import {
  getConversationRecipientUserIds,
  resolvePointerTarget,
} from "../pointer-target";
import { BatchUpdateLastReceivedMessagesRequest } from "./batch-update-last-received-messages.request";
import { BatchUpdateLastReceivedMessagesResponse } from "./batch-update-last-received-messages.response";
import { IBatchUpdateLastReceivedMessagesUseCase } from "./batch-update-last-received-messages.usecase";

@injectable()
export class BatchUpdateLastReceivedMessagesUseCase
  implements IBatchUpdateLastReceivedMessagesUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private readonly participantRepository: IParticipantRepository,

    @inject(TYPES.MessageRepository)
    private readonly messageRepository: IMessageRepository,

    @inject(TYPES.MessagePublisher)
    private messagePublisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger)
    private readonly logger: ILogger
  ) {}

  async execute({
    userId,
    items,
  }: BatchUpdateLastReceivedMessagesRequest): Promise<BatchUpdateLastReceivedMessagesResponse> {
    try {
      // Resolve each item to the user's own participant. Items for conversations the user is not
      // in, or for messages outside the conversation, are skipped.
      const updates: PublishLastMessageReceivedPayload[] = [];

      for (const { conversationId, messageId } of items) {
        const { data: target, error } = await resolvePointerTarget(
          this.participantRepository,
          this.messageRepository,
          { userId, conversationId, messageId }
        );

        if (error || !target) {
          this.logger.error(
            `[BatchUpdateLastReceivedMessagesUseCase]: Skipping conversation ${conversationId}: ${error}`
          );
          continue;
        }

        updates.push({
          conversationId,
          participantId: target.participant.id,
          messageId,
          messageCreatedAt: target.messageCreatedAt,
        });
      }

      const pointerUpdates: IParticipantPointerUpdateDTO[] = updates.map(
        ({ participantId, messageId, messageCreatedAt }) => ({
          participantId,
          messageId,
          messageCreatedAt,
        })
      );

      const { value: movedParticipantIds, error } =
        await this.participantRepository.batchUpdateLastReceivedMessages(
          pointerUpdates
        );

      if (error || !movedParticipantIds) {
        return {
          data: null,
          error:
            error?.message || "Error batch updating last received messages",
        };
      }

      const movedUpdates = updates.filter(({ participantId }) =>
        movedParticipantIds.includes(participantId)
      );

      // Publish one event per conversation so each only reaches that conversation's participants.
      const updatesByConversation = groupBy(movedUpdates, "conversationId");

      for (const [conversationId, conversationUpdates] of Object.entries(
        updatesByConversation
      )) {
        const { data: recipientUserIds, error: recipientsError } =
          await getConversationRecipientUserIds(
            this.participantRepository,
            conversationId
          );

        if (recipientsError) {
          this.logger.error(
            `[BatchUpdateLastReceivedMessagesUseCase]: Received update saved but not published for conversation ${conversationId}: ${recipientsError}`
          );
          continue;
        }

        await this.messagePublisher.publishLastReceivedMessageUpdated({
          recipientUserIds,
          updates: conversationUpdates,
        });
      }

      return { data: true };
    } catch (error) {
      return {
        data: null,
        error: error.message || "Error batch updating last received messages",
      };
    }
  }
}
