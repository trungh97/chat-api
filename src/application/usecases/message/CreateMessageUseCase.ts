import { ICreateMessageRequestDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import {
  IConversationRepository,
  IMessageRepository,
} from "@domain/repositories";
import { ICreateConversationUsecase } from "@domain/usecases/conversation";
import { ICreateMessageUseCase } from "@domain/usecases/message";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { UseCaseResponse } from "@shared/responses";
import { inject, injectable } from "inversify";
import isNull from "lodash/isNull";

@injectable()
export class CreateMessageUseCase implements ICreateMessageUseCase {
  constructor(
    @inject(TYPES.MessagePrismaRepository)
    private messageRepository: IMessageRepository,

    @inject(TYPES.ConversationPrismaRepository)
    private conversationRepository: IConversationRepository,

    @inject(TYPES.CreateConversationUseCase)
    private createConversationUseCase: ICreateConversationUsecase,

    @inject(TYPES.WinstonLogger)
    private logger: ILogger
  ) {}

  async execute(
    currentUserId: string,
    request: ICreateMessageRequestDTO
  ): Promise<UseCaseResponse<Message>> {
    try {
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

      if (isNull(request.conversationId)) {
        // Create a new conversation in case this is the first message.
        const { data: newConversation, error: newConversationError } =
          await this.createConversationUseCase.execute(currentUserId, {
            participants: request.receivers,
          });

        if (newConversationError) {
          return {
            data: null,
            error: `Error starting conversation: ${newConversationError}`,
          };
        }

        request.conversationId = newConversation.id;
      } else {
        // Check if the conversation exists and if the user is a participant.
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
      }

      const messageData = await Message.create(request, currentUserId);

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
