import { UseCaseResponse } from "@shared/responses";
import { IMessageUseCaseDTO } from "../create-message";

export type CreateSystemMessageResponse = UseCaseResponse<IMessageUseCaseDTO>;
