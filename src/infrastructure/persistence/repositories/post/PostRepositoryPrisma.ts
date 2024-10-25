import { PostMapper } from "@application/mappers";
import { Post } from "@domain/entities";
import { Result } from "@domain/repositories";
import { IPostRepository } from "@domain/repositories/PostRepository";
import { PrismaClient } from "@prisma/client";

export class PostRepositoryPrisma implements IPostRepository {
  /**
   * Create an instance of PostRepository
   *
   * @constructor
   * @param {PrismaClient} prisma - The Prisma client instance.
   */
  constructor(private prisma: PrismaClient) {}

  /**
   * Find all posts with given params
   *
   * @async
   * @param {any} params - search params
   * @returns {Promise<Post[]>} - The posts data.
   */
  async findAll(params: any): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = posts.map((post) =>
      PostMapper.toDomainFromPersistence(post)
    );

    return response;
  }

  async countAll(params: any): Promise<number> {
    const count = await this.prisma.post.count();
    return count;
  }

  async findById<_, E = Error>(id: string): Promise<Result<Post | null, E>> {
    try {
      const post = await this.prisma.post.findUnique({ where: { id } });

      if (!post) {
        return {
          success: false,
          value: null,
          error: new Error("Post not found") as E,
        };
      }

      const response = PostMapper.toDomainFromPersistence(post);

      return { success: true, value: response };
    } catch (error) {
      return {
        success: false,
        value: null,
        error: new Error(error.message) as E,
      };
    }
  }

  async create(post: Post): Promise<Post> {
    const newPost = await this.prisma.post.create({ data: post });

    const response = PostMapper.toDomainFromPersistence(newPost);

    return response;
  }

  async updateById(post: Post): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: { id: post.id },
      data: post,
    });

    const response = PostMapper.toDomainFromPersistence(updatedPost);

    return response;
  }

  async deleteById(id: string): Promise<void> {
    const deletedPost = await this.prisma.post.delete({ where: { id } });

    if (!deletedPost) {
      throw new Error("Post not found");
    }

    return;
  }
}
