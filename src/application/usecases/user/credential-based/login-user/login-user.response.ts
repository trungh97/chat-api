import { User } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type LoginCredentialBasedUserResponse = UseCaseResponse<User>;
