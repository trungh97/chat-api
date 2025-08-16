import { UseCaseResponse } from "@shared/responses";
import { MessageWithSenderUseCaseDTO } from "../types";

export type CreateSystemMessageResponse =
  UseCaseResponse<MessageWithSenderUseCaseDTO>;
