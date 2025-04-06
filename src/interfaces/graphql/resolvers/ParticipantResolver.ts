import { ICreateParticipantRequestDTO } from "@domain/dtos/participant";
import { IAddingParticipantAndNotifyUseCase } from "@domain/usecases/participant";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Resolver } from "type-graphql";
import { Context } from "types";
import { ParticipantDTO } from "../DTOs";
import { ParticipantMapper } from "../mappers";
import { ParticipantCreateMutationRequest } from "../types/participant";

const ParticipantResponseObjectType = GlobalResponse(ParticipantDTO);

@ObjectType()
class ParticipantResponse extends ParticipantResponseObjectType {}

@Resolver()
export class ParticipantResolver {
  private addParticipantAndNotifyUseCase: IAddingParticipantAndNotifyUseCase;
  private logger: ILogger;

  constructor() {
    this.addParticipantAndNotifyUseCase =
      container.get<IAddingParticipantAndNotifyUseCase>(
        TYPES.AddParticipantAndNotifyUseCase
      );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Mutation(() => ParticipantResponse)
  async createParticipant(
    @Arg("request", () => ParticipantCreateMutationRequest)
    request: ICreateParticipantRequestDTO,
    @Ctx()
    {
      req: {
        session: { userId },
      },
    }: Context
  ): Promise<ParticipantResponse> {
    try {
      if (!userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const participant = await this.addParticipantAndNotifyUseCase.execute(
        request,
        userId
      );

      if (participant.error || !participant.data) {
        this.logger.error(`Error adding participant: ${participant.error}`);
        return {
          statusCode: StatusCodes.NOT_FOUND,
          error: "Failed to adding new participant",
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Participant added successfully!",
        data: ParticipantMapper.toDTO(participant.data),
      };
    } catch (error) {
      this.logger.error(`Error adding participant: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
