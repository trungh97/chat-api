import { IDetailedParticipantDTO } from "@domain/dtos";
import { Participant } from "@domain/entities";
import { ParticipantType } from "@domain/enums";
import { IParticipantRepository } from "@domain/repositories";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ParticipantPrismaMapper } from "@infrastructure/persistence/mappers";
import { PrismaClient } from "@prisma/client";
import { ILogger } from "@shared/logger";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class ParticipantPrismaRepository implements IParticipantRepository {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  async createParticipant({
    conversationId,
    userId,
    type,
  }: Participant): Promise<RepositoryResponse<IDetailedParticipantDTO, Error>> {
    try {
      const createdParticipant = await this.prisma.participant.create({
        data: {
          conversationId,
          userId,
          type,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return {
        value:
          ParticipantPrismaMapper.fromPrismaModelToDetailDTO(
            createdParticipant
          ),
      };
    } catch (error) {
      this.logger.error(`Error creating participant: ${error.message}`);
      return {
        value: null,
        error: new Error(`Error creating participant: ${error.message}`),
      };
    }
  }

  async getParticipantById(
    conversationId: string,
    userId: string
  ): Promise<RepositoryResponse<Participant, Error>> {
    try {
      const participant = await this.prisma.participant.findFirst({
        where: { conversationId, userId },
      });

      if (!participant) {
        return {
          value: null,
          error: new Error(`Participant not found`),
        };
      }

      return {
        value: ParticipantPrismaMapper.fromPrismaModelToEntity(participant),
      };
    } catch (error) {
      this.logger.error(`Error fetching participant: ${error.message}`);
      return {
        value: null,
        error: new Error(`Error fetching participant: ${error.message}`),
      };
    }
  }

  async getParticipantsByConversationId(
    conversationId: string
  ): Promise<RepositoryResponse<Participant[], Error>> {
    try {
      const participants = await this.prisma.participant.findMany({
        where: { conversationId },
      });

      return {
        value: participants.map(
          ParticipantPrismaMapper.fromPrismaModelToEntity
        ),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching participants for conversation ${conversationId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error fetching participants for conversation ${conversationId}: ${error.message}`
        ),
      };
    }
  }

  async updateParticipantType(
    id: string,
    type: ParticipantType
  ): Promise<RepositoryResponse<Participant, Error>> {
    try {
      const updatedParticipant = await this.prisma.participant.update({
        where: { id },
        data: { type },
      });

      return {
        value:
          ParticipantPrismaMapper.fromPrismaModelToEntity(updatedParticipant),
      };
    } catch (error) {
      this.logger.error(
        `Error updating participant type for id ${id}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error updating participant type for id ${id}: ${error.message}`
        ),
      };
    }
  }

  async deleteParticipantById(
    id: string
  ): Promise<RepositoryResponse<boolean, Error>> {
    try {
      await this.prisma.participant.delete({
        where: { id },
      });

      return {
        value: true,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting participant with id ${id}: ${error.message}`
      );
      return {
        value: false,
        error: new Error(
          `Error deleting participant with id ${id}: ${error.message}`
        ),
      };
    }
  }

  async getParticipantsNamesByIds(
    userIds: string[]
  ): Promise<RepositoryResponse<string[], Error>> {
    try {
      const participants = await this.prisma.participant.findMany({
        where: {
          userId: {
            in: userIds,
          },
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!participants) {
        return {
          value: null,
          error: new Error(`Participants not found`),
        };
      }

      return {
        value: participants.map(
          (participant) =>
            `${participant.user.firstName} ${participant.user.lastName}`
        ),
      };
    } catch (error) {
      this.logger.error(`Error fetching participants: ${error.message}`);
      return {
        value: null,
        error: new Error(`Error fetching participants: ${error.message}`),
      };
    }
  }

  async updateLastSeenMessage(
    messageId: string,
    participantId: string
  ): Promise<RepositoryResponse<IDetailedParticipantDTO, Error>> {
    try {
      const updatedParticipant = await this.prisma.participant.update({
        where: { id: participantId },
        data: { lastSeenMessageId: messageId, lastSeenAt: new Date() },
      });

      return {
        value:
          ParticipantPrismaMapper.fromPrismaModelToDetailDTO(
            updatedParticipant
          ),
      };
    } catch (error) {
      this.logger.error(
        `Error updating last seen message for participant ${participantId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error updating last seen message for participant ${participantId}: ${error.message}`
        ),
      };
    }
  }

  async updateLastReceivedMessage(
    messageId: string,
    participantId: string
  ): Promise<RepositoryResponse<IDetailedParticipantDTO, Error>> {
    try {
      const updatedParticipant = await this.prisma.participant.update({
        where: { id: participantId },
        data: { lastReceivedMessageId: messageId },
      });

      return {
        value:
          ParticipantPrismaMapper.fromPrismaModelToDetailDTO(
            updatedParticipant
          ),
      };
    } catch (error) {
      this.logger.error(
        `Error updating last received message for participant ${participantId}: ${error.message}`
      );
      return {
        value: null,
        error: new Error(
          `Error updating last received message for participant ${participantId}: ${error.message}`
        ),
      };
    }
  }
}
