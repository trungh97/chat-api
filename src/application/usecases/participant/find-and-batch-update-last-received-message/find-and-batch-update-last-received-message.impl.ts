import { IMessageEventPublisher } from "@domain/events";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { inject, injectable } from "inversify";
import { IBatchUpdateLastReceivedMessagesUseCase } from "../batch-update-last-received-messages";
import { FindAndBatchUpdateLastReceivedMessageRequest } from "./find-and-batch-update-last-received-message.request";
import { FindAndBatchUpdateLastReceivedMessageResponse } from "./find-and-batch-update-last-received-message.response";
import { IFindAndBatchUpdateLastReceivedMessageUseCase } from "./find-and-batch-update-last-received-message.usecase";

@injectable()
export class FindAndBatchUpdateLastReceivedMessageUseCase
  implements IFindAndBatchUpdateLastReceivedMessageUseCase
{
  constructor(
    @inject(TYPES.ConversationRepository)
    private readonly conversationRepository: IConversationRepository,

    @inject(TYPES.BatchUpdateLastReceivedMessagesUseCase)
    private readonly batchUpdateLastReceivedMessagesUseCase: IBatchUpdateLastReceivedMessagesUseCase,

    @inject(TYPES.MessagePublisher)
    private readonly messagePublisher: IMessageEventPublisher,

    @inject(TYPES.WinstonLogger) private readonly logger: ILogger
  ) {}

  async execute(
    request: FindAndBatchUpdateLastReceivedMessageRequest
  ): Promise<FindAndBatchUpdateLastReceivedMessageResponse> {
    try {
      // Fetch all behind conversations for the user
      const behindConversationsResp =
        await this.conversationRepository.findBehindConversations(
          request.userId
        );

      if (behindConversationsResp.error || !behindConversationsResp.value) {
        return {
          data: null,
          error:
            behindConversationsResp.error?.message ||
            "Failed to fetch behind conversations",
        };
      }
      const behindConversations = behindConversationsResp.value;

      // Convert to batch update request format
      const updates = behindConversations.map((conv) => ({
        participantId: conv.participantId,
        messageId: conv.lastMessageId,
      }));

      // Call batch update use-case
      const batchUpdateResp =
        await this.batchUpdateLastReceivedMessagesUseCase.execute(updates);

      if (batchUpdateResp.error || !batchUpdateResp.data) {
        return {
          data: null,
          error: batchUpdateResp.error || "Failed to batch update",
        };
      }

      // Publish events if needed (omitted for brevity)
      await this.messagePublisher.publishLastReceivedMessageUpdated(updates);

      return { data: true };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Error in find and batch update",
      };
    }
  }
}
