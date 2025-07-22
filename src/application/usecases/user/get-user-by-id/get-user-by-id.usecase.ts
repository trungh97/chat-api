import { GetUserByIdRequest } from "./get-user-by-id.request";
import { GetUserByIdResponse } from "./get-user-by-id.response";

export interface IGetUserByIdUsecase {
  execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse>;
}
