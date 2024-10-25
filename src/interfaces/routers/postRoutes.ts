import { FindPostByIDUseCase } from "@application/usecases/post";
import { prismaClient } from "@infrastructure/persistence/databases/mysql/connection";
import { PostRepositoryPrisma } from "@infrastructure/persistence/repositories/post/PostRepositoryPrisma";
import { Router } from "express";
import { FindPostByIdController } from "interfaces/controllers/post";

const router = Router();

const postRepository = new PostRepositoryPrisma(prismaClient);
const findPostByIdUseCase = new FindPostByIDUseCase(postRepository);
const findPostByIdController = new FindPostByIdController(findPostByIdUseCase);

router.get("/:id", findPostByIdController.handle.bind(findPostByIdController));

export { router as postRoutes };
