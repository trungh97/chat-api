import { UseCaseResponse } from "@shared/responses";
import { IMessageWithSenderUseCaseDTO } from "../types";

export type CreateMessageResponse =
  UseCaseResponse<IMessageWithSenderUseCaseDTO>;
