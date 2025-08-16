import { UseCaseResponse } from "@shared/responses";
import { MessageWithSenderUseCaseDTO } from "../types";

export type CreateMessageResponse =
  UseCaseResponse<MessageWithSenderUseCaseDTO>;
