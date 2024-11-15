import { Arg, ID, ObjectType, Query, Resolver } from "type-graphql";

import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { container, TYPES } from "@infrastructure/external/di/inversify";
import { GlobalResponse } from "@shared/responses";

import { PostDTO } from "../DTOs";
import { PostMapper } from "../mappers";

const PostResponse = GlobalResponse(PostDTO);

@ObjectType()
class PostGlobalResponse extends PostResponse {}

@Resolver()
export class PostResolver {
  private findPostByIdUseCase: IFindPostByIDUseCase;

  constructor() {
    this.findPostByIdUseCase = container.get<IFindPostByIDUseCase>(
      TYPES.FindPostByIDUseCase
    );
  }

  @Query(() => PostGlobalResponse)
  async findPostById(
    @Arg("id", () => ID) id: string
  ): Promise<PostGlobalResponse> {
    try {
      const result = await this.findPostByIdUseCase.execute(id);
      if (result.error) {
        return {
          error: result.error,
          data: null,
        };
      }

      return {
        statusCode: 200,
        data: PostMapper.toDTO(result.data),
      };
    } catch (error) {
      return {
        statusCode: 500,
        error: error.message,
        data: null,
      };
    }
  }
}
