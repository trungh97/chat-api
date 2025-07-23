import { IMessageRepositoryDTO } from "@domain/dtos/message";
import { Message } from "@domain/entities";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { IMessageRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { MessagePrismaMapper } from "@infrastructure/persistence/mappers";
import { PrismaClient } from "@prisma/client";
import { PAGE_LIMIT } from "@shared/constants";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class MessagePrismaRepository implements IMessageRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async createMessage(
    message: Message
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>> {
    try {
      const createdMessage = await this.prisma.message.create({
        data: {
          id: message.id,
          content: message.content,
          extra: JSON.stringify(message.extra),
          messageType: message.messageType,
          conversation: {
            connect: { id: message.conversationId },
          },
          ...(message.senderId && {
            sender: { connect: { id: message.senderId } },
          }),
          ...(message.replyToMessageId && {
            replyToMessage: { connect: { id: message.replyToMessageId } },
          }),
        },
      });
      console.log(createdMessage);
      return {
        value: MessagePrismaMapper.fromPrismaModelToDTO(createdMessage),
      };
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      return {
        value: null,
        error: new Error(`Error creating message: ${error.message}`),
      };
    }
  }

  async getMessageById(
    id: string
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id },
      });

      if (!message) {
        return {
          value: null,
          error: new Error(`Message with id ${id} not found`),
        };
      }

      return {
        value: MessagePrismaMapper.fromPrismaModelToDTO(message),
      };
    } catch (error) {
      this.logger.error(`Error fetching message by id ${id}: ${error.message}`);
      return {
        value: null,
        error: new Error(
          `Error fetching message by id ${id}: ${error.message}`
        ),
      };
    }
  }

  async updateMessage(
    id: string,
    updates: Partial<Message>
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>> {
    try {
      const updatedMessage = await this.prisma.message.update({
        where: { id },
        data: {
          content: updates.content,
        },
      });

      return {
        value: MessagePrismaMapper.fromPrismaModelToDTO(updatedMessage),
      };
    } catch (error) {
      this.logger.error(
        `Error updating message with id ${id}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error updating message with id ${id}: ${error.message}`
        ),
      };
    }
  }

  async deleteMessage(id: string): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.message.delete({
        where: { id },
      });

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting message with id ${id}: ${error.message}`
      );
      return {
        value: false,
        error: new Error(
          `Error deleting message with id ${id}: ${error.message}`
        ),
      };
    }
  }

  async getMessagesByConversationId(
    conversationId: string,
    cursor?: string,
    limit: number = PAGE_LIMIT
  ): Promise<
    RepositoryResponse<
      ICursorBasedPaginationResponse<IMessageRepositoryDTO>,
      Error
    >
  > {
    try {
      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        include: {
          sender: true,
        },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
      });

      const nextCursor =
        messages.length > limit ? messages[limit].id : undefined;

      return {
        value: {
          data: messages
            .slice(0, limit)
            .map((message) =>
              MessagePrismaMapper.fromPrismaModelToDTO(message)
            ),
          nextCursor,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error fetching messages for conversation ${conversationId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching messages for conversation ${conversationId}: ${error.message}`
        ),
      };
    }
  }

  async getLastMessageByConversationId(
    conversationId: string
  ): Promise<RepositoryResponse<IMessageRepositoryDTO, Error>> {
    try {
      const message = await this.prisma.message.findFirst({
        where: { conversationId },
        orderBy: { createdAt: "desc" }, // Get the most recent message
      });

      if (!message) {
        return {
          value: null,
          error: new Error(
            `No messages found for conversation ${conversationId}`
          ),
        };
      }

      return {
        value: MessagePrismaMapper.fromPrismaModelToDTO(message),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching last message for conversation ${conversationId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching last message for conversation ${conversationId}: ${error.message}`
        ),
      };
    }
  }
}
