import { Message } from "@domain/entities";
import { UseCaseResponse } from "@shared/responses";

export type GetMessageByIdResponse = UseCaseResponse<Message>;
