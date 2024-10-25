import { IFindPostByIDUseCase } from "@domain/usecases/post";
import { Request, Response } from "express";
import { IBaseController } from "../BaseController";
import { controllerResponse } from "../utils/controllerResponse";

export class FindPostByIdController implements IBaseController {
  constructor(private findPostByIdUseCase: IFindPostByIDUseCase) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const postId = request.params.id;
      const result = await this.findPostByIdUseCase.execute(postId);

      if (result.error) {
        return response
          .status(404)
          .json(controllerResponse(null, false, result.error, result.error));
      }

      return response.status(200).json(controllerResponse(result.data, true));
    } catch (error) {
      return response
        .status(500)
        .json(controllerResponse(null, false, error.message, error.message));
    }
  }
}
