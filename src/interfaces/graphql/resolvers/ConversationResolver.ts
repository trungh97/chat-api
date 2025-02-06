import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import {
  ICreateConversationUsecase,
  IGetAllConversationsUsecase,
} from "@domain/usecases/conversation";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { ConversationDTO } from "../DTOs";
import { ConversationMapper } from "../mappers";
import { CursorBasedPaginationParams } from "../types/pagination";
import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";

const ConversationResponse = GlobalResponse(ConversationDTO);
const ConversationListResponse = GlobalResponse(ConversationDTO, true);

@ObjectType()
class ConversationGlobalResponse extends ConversationResponse {}

@ObjectType()
class ConversationListGlobalResponse extends ConversationListResponse {}

@Resolver()
export class ConversationResolver {
  constructor(
    private getAllConversationsUseCase: IGetAllConversationsUsecase,
    private createConversationUseCase: ICreateConversationUsecase,
    private logger: ILogger
  ) {
    this.getAllConversationsUseCase =
      container.get<IGetAllConversationsUsecase>(
        TYPES.GetAllConversationsUseCase
      );
    this.createConversationUseCase = container.get<ICreateConversationUsecase>(
      TYPES.CreateConversationUseCase
    );
    this.logger = container.get<ILogger>(TYPES.WinstonLogger);
  }

  @Query(() => ConversationListGlobalResponse)
  async getAllConversations(
    @Arg("options", () => CursorBasedPaginationParams)
    options: ICursorBasedPaginationParams
  ): Promise<ConversationListGlobalResponse> {
    try {
      const { cursor, limit } = options;
      const result = await this.getAllConversationsUseCase.execute({
        cursor,
        limit,
      });

      const { data, error } = result;

      if (error) {
        this.logger.error(error);
        return {
          error,
        };
      }

      return {
        statusCode: StatusCodes.OK,
        message: "Get conversations successfully!",
        data: data.data.map(ConversationMapper.toDTO),
      };
    } catch (error) {
      this.logger.error(`Error getting all conversations: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }

  @Mutation(() => ConversationGlobalResponse)
  async createConversation(
    @Arg("conversation") conversation: ICreateConversationRequestDTO
  ): Promise<ConversationGlobalResponse> {
    try {
      const result = await this.createConversationUseCase.execute(conversation);

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
        };
      }

      return {
        statusCode: StatusCodes.CREATED,
        message: "Conversation created successfully!",
        data: ConversationMapper.toDTO(result.data),
      };
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`);
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
      };
    }
  }
}
