import { ICreateMessageRequestDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { ICreateMessageUseCase } from "@domain/usecases/message";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class CreateMessageUseCase implements ICreateMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    currentUserId: string,
    request: ICreateMessageRequestDTO
  ): Promise<UseCaseResponse<Message>> {
    try {
      if (currentUserId !== request.senderId) {
        this.logger.error(
          `User ${currentUserId} is not authorized to create a message for user ${request.senderId}`
        );
        return {
          data: null,
          error: `User ${currentUserId} is not authorized to create a message for user ${request.senderId}`,
        };
      }

      if (!request.content.trim()) {
        return {
          data: null,
          error: "Message content cannot be empty",
        };
      }

      if (request.content.trim().length > 1000) {
        return {
          data: null,
          error: "Message content cannot be longer than 1000 characters",
        };
      }

      const { value: conversation, error: conversationError } =
        await this.conversationRepository.getConversationById(
          request.conversationId
        );

      if (conversationError || !conversation.id) {
        return {
          data: null,
          error: `Conversation with ID ${request.conversationId} does not exist.`,
        };
      }

      const isMember = conversation.participants.some(
        (participant) => participant.id === currentUserId
      );

      if (!isMember) {
        return {
          data: null,
          error: `User ${currentUserId} is not a participant in the conversation.`,
        };
      }

      const messageData = await Message.create(request);

      const response = await this.messageRepository.createMessage(messageData);

      if (response.error) {
        this.logger.error(`Error creating message: ${response.error.message}`);
        return { data: null, error: response.error.message };
      }
      return { data: response.value };
    } catch (error) {
      this.logger.error(
        `Error executing create message use case: ${error.message}`
      );
      return {
        data: null,
        error: `Error executing create message use case: ${error.message}`,
      };
    }
  }
}
