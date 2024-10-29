import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { Arg, Ctx, ID, Query, Resolver } from "type-graphql";
import { container, TYPES } from "@infrastructure/persistence/di/inversify";
import { PostDTO } from "../DTOs";
import { PostMapper } from "../mappers";

@Resolver()
export class PostResolver {
  private findPostByIdUseCase: IFindPostByIDUseCase;

  constructor() {
    this.findPostByIdUseCase = container.get<IFindPostByIDUseCase>(
      TYPES.FindPostByIDUseCase
    );
  }

  @Query(() => PostDTO)
  async findPostById(
    @Arg("id", () => ID) id: string
    // @Ctx()
    // { findPostByIdUseCase }: { findPostByIdUseCase: IFindPostByIDUseCase }
  ): Promise<PostDTO | null> {
    const result = await this.findPostByIdUseCase.execute(id);
    console.log(result);
    if (result.error) {
      return null;
    }

    return PostMapper.toDTO(result.data);
  }
}
