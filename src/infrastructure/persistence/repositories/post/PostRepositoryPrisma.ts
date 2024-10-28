import { Post } from "@domain/entities";
import { Result } from "@domain/repositories";
import { IPostRepository } from "@domain/repositories/PostRepository";
import { Post as PostPrismaModel, PrismaClient } from "@prisma/client";

export class PostRepositoryPrisma implements IPostRepository {
  /**
   * Create an instance of PostRepository
   *
   * @constructor
   * @param {PrismaClient} prisma - The Prisma client instance.
   */
  constructor(private prisma: PrismaClient) {}

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

      const response = this.toDomainFromPersistence(post);

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
