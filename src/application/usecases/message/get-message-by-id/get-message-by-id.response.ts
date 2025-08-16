import { UseCaseResponse } from "@shared/responses";
import { IMessageWithSenderUseCaseDTO } from "../types";

export type GetMessageByIdResponse =
  UseCaseResponse<IMessageWithSenderUseCaseDTO>;
