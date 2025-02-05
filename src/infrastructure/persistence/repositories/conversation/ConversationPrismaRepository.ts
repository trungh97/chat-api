import {
  Conversation as ConversationPrismaModel,
  PrismaClient,
} from "@prisma/client";
import { inject, injectable } from "inversify";

import { Conversation } from "@domain/entities";
import { IConversationRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { ICursorBasedPaginationResponse } from "@domain/interfaces/pagination/CursorBasedPagination";
import { PAGE_LIMIT } from "@shared/constants";

@injectable()
class ConversationPrismaRepository implements IConversationRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  private toDomainFromPersistence(
    conversationPrismaModel: ConversationPrismaModel
  ): Conversation {
    return new Conversation({
      id: conversationPrismaModel.id,
      title: conversationPrismaModel.title,
      creatorId: conversationPrismaModel.creatorId,
      createdAt: conversationPrismaModel.createdAt,
      updatedAt: conversationPrismaModel.updatedAt,
      isArchived: conversationPrismaModel.isArchived,
      deletedAt: conversationPrismaModel.deletedAt,
    });
  }

  async getAllConversations(
    cursor?: string,
    limit = PAGE_LIMIT
  ): Promise<
    RepositoryResponse<ICursorBasedPaginationResponse<Conversation>, Error>
  > {
    try {
      const conversations = await this.prisma.conversation.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
      });

      const nextCursor =
        conversations.length > limit ? conversations[limit].id : undefined;

      return {
        value: {
          data: conversations.slice(0, limit).map(this.toDomainFromPersistence),
          nextCursor,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting all conversations: ${error.message}`);
      return {
        error: new Error(`Error getting all conversations: ${error.message}`),
        value: {
          data: [],
          nextCursor: undefined,
        },
      };
    }
  }

  async getConversationById(
    id: string
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id },
      });

      if (!conversation) {
        return {
          error: new Error("Conversation not found"),
          value: null,
        };
      }

      return {
        value: this.toDomainFromPersistence(conversation),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching conversation by id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error getting conversation by id ${id}`),
        value: null,
      };
    }
  }

  async createConversation(
    conversation: Conversation
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const newConversation = await this.prisma.conversation.create({
        data: {
          id: conversation.id,
          title: conversation.title,
          creatorId: conversation.creatorId,
          isArchived: conversation.isArchived,
          deletedAt: conversation.deletedAt,
        },
      });

      return { value: this.toDomainFromPersistence(newConversation) };
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`);
      return {
        error: new Error(`Error creating conversation: ${error.message}`),
        value: null,
      };
    }
  }

  async updateConversation(
    id: string,
    conversation: Conversation
  ): Promise<RepositoryResponse<Conversation, Error>> {
    try {
      const updatedConversation = await this.prisma.conversation.update({
        where: { id },
        data: {
          title: conversation.title,
          creatorId: conversation.creatorId,
          isArchived: conversation.isArchived,
          deletedAt: conversation.deletedAt,
        },
      });

      return { value: this.toDomainFromPersistence(updatedConversation) };
    } catch (error) {
      this.logger.error(
        `Error updating conversation with id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error updating conversation with id ${id}`),
        value: null,
      };
    }
  }

  async deleteConversation(
    id: string
  ): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.conversation.delete({
        where: { id },
      });

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting conversation with id ${id}: ${error.message}`
      );
      return {
        error: new Error(`Error deleting conversation with id ${id}`),
        value: null,
      };
    }
  }
}

export { ConversationPrismaRepository };
