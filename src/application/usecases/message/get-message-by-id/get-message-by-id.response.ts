import { UseCaseResponse } from "@shared/responses";
import { MessageWithSenderUseCaseDTO } from "../types";

export type GetMessageByIdResponse =
  UseCaseResponse<MessageWithSenderUseCaseDTO>;
