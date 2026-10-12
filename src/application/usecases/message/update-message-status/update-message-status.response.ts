import { UseCaseResponse } from "@shared/responses";
import { IMessageWithSenderUseCaseDTO } from "../types";

export type UpdateMessageStatusResponse =
  UseCaseResponse<IMessageWithSenderUseCaseDTO>;
