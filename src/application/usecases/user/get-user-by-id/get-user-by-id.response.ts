import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type GetUserByIdResponse = UseCaseResponse<User>;
