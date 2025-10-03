import { IParticipantRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { inject, injectable } from "inversify";
import { BatchUpdateLastReceivedMessagesRequest } from "./batch-update-last-received-messages.request";
import { BatchUpdateLastReceivedMessagesResponse } from "./batch-update-last-received-messages.response";
import { IBatchUpdateLastReceivedMessagesUseCase } from "./batch-update-last-received-messages.usecase";
import { IMessageEventPublisher } from "@domain/events";

@injectable()
export class BatchUpdateLastReceivedMessagesUseCase
  implements IBatchUpdateLastReceivedMessagesUseCase
{
  constructor(
    @inject(TYPES.ParticipantRepository)
    private readonly participantRepository: IParticipantRepository,

    @inject(TYPES.MessagePublisher)
    private messagePublisher: IMessageEventPublisher
  ) {}

  async execute(
    request: BatchUpdateLastReceivedMessagesRequest
  ): Promise<BatchUpdateLastReceivedMessagesResponse> {
    try {
      const { value, error } =
        await this.participantRepository.batchUpdateLastReceivedMessages(
          request
        );

      if (error || !value) {
        return {
          data: null,
          error:
            error?.message || "Error batch updating last received messages",
        };
      }

      await this.messagePublisher.publishLastReceivedMessageUpdated(request);

      return { data: value };
    } catch (error) {
      return {
        data: null,
        error: error.message || "Error batch updating last received messages",
      };
    }
  }
}
