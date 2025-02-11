import { ICreateConversationRequestDTO } from "@domain/dtos/conversation";
import { ICursorBasedPaginationParams } from "@domain/interfaces/pagination/CursorBasedPagination";
import {
  ICreateConversationUsecase,
  IGetAllConversationsUsecase,
} from "@domain/usecases/conversation";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { ILogger } from "@shared/logger";
import { GlobalResponse } from "@shared/responses";
import { StatusCodes } from "http-status-codes";
import { Arg, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "types";
import { ConversationDTO } from "../DTOs";
import { ConversationMapper } from "../mappers";
import { ConversationCreateMutationRequest } from "../types/conversation";
import { CursorBasedPaginationParams } from "../types/pagination";

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
    @Arg("conversation", () => ConversationCreateMutationRequest)
    conversation: ICreateConversationRequestDTO,
    @Ctx() { req }: Context
  ): Promise<ConversationGlobalResponse> {
    try {
      const { participants } = conversation;

      if (!req.session.userId) {
        return {
          statusCode: StatusCodes.UNAUTHORIZED,
          error: "User is not authenticated",
        };
      }

      const currentUser = req.session.userId;

      const result = await this.createConversationUseCase.execute(
        currentUser,
        participants,
        conversation
      );

      if (result.error) {
        this.logger.error(result.error);
        return {
          error: result.error,
          statusCode: StatusCodes.BAD_REQUEST,
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
