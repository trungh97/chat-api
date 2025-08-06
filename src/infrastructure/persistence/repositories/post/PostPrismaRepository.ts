import { Post } from "@domain/entities";
import { IPostRepository } from "@domain/repositories/PostRepository";
import { TYPES } from "@infrastructure/external/di/inversify/types";
import { ILogger } from "@shared/logger";
import { Post as PostPrismaModel, PrismaClient } from "@prisma/client";
import { RepositoryResponse } from "@shared/responses";
import { inject, injectable } from "inversify";

@injectable()
export class PostPrismaRepository implements IPostRepository {
  /**
   * Create an instance of PostRepository
   *
   * @constructor
   * @param {PrismaClient} prisma - The Prisma client instance.
   * @param {ILogger} logger - The logger instance.
   */
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.WinstonLogger) private logger: ILogger
  ) {}

  /**
   * Maps a Post entity retrieved from the persistence layer to a Post entity.
   *
   * @param {Post} post - The Post entity retrieved from the persistence layer.
   * @returns {Post} - The mapped Post entity.
   */
  private toDomainFromPersistence(post: PostPrismaModel): Post {
    return new Post(post.id, post.title, post.content);
  }

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

    const response = posts.map((post) => this.toDomainFromPersistence(post));

    return response;
  }

  async countAll(params: any): Promise<number> {
    const count = await this.prisma.post.count();
    return count;
  }

  async findById(id: string): Promise<RepositoryResponse<Post, Error>> {
    try {
      this.logger.info(`Finding post by id ${id}...`);
      const post = await this.prisma.post.findUnique({ where: { id } });

      if (!post) {
        this.logger.error(`Post not found`);
        return {
          success: false,
          value: null,
          error: new Error("Post not found"),
        };
      }

      const response = this.toDomainFromPersistence(post);

      return { success: true, value: response };
    } catch (error) {
      this.logger.error(`Error finding post by id ${id}`);
      return {
        success: false,
        value: null,
        error: new Error(error.message),
      };
    }
  }

  async create(post: Post): Promise<Post> {
    const newPost = await this.prisma.post.create({ data: post });

    const response = this.toDomainFromPersistence(newPost);

    return response;
  }

  async updateById(post: Post): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: { id: post.id },
      data: post,
    });

    const response = this.toDomainFromPersistence(updatedPost);

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
