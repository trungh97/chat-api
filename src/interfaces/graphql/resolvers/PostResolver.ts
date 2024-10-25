import { IFindPostByIDUseCase } from "@domain/usecases/post";

export const resolvers = {
  Query: {
    findPostById: async (
      _: any,
      { id }: { id: string },
      { findPostByIdUseCase }: { findPostByIdUseCase: IFindPostByIDUseCase }
    ) => {
      const result = await findPostByIdUseCase.execute(id);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
  },
};
