import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { Arg, Ctx, ID, Query, Resolver } from "type-graphql";
import { PostDTO } from "../DTOs";
import { PostMapper } from "../mappers";

@Resolver()
export class PostResolver {
  @Query(() => PostDTO)
  async findPostById(
    @Arg("id", () => ID) id: string,
    @Ctx()
    { findPostByIdUseCase }: { findPostByIdUseCase: IFindPostByIDUseCase }
  ): Promise<PostDTO | null> {
    const result = await findPostByIdUseCase.execute(id);
    console.log(result);
    if (result.error) {
      return null;
    }

    return PostMapper.toDTO(result.data);
  }
}
