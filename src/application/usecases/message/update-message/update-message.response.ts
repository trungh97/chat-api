import { UseCaseResponse } from "@shared/responses";
import { MessageWithSenderUseCaseDTO } from "../types";

export type UpdateMessageResponse =
  UseCaseResponse<MessageWithSenderUseCaseDTO>;
