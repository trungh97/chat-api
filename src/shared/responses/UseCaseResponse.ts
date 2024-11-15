import { CommonMessageError } from "@shared/httpErrors";

export interface UseCaseResponse<T> {
  data: T | null;
  error?: string;
}

export const useCaseInternalServerError: UseCaseResponse<null> = {
  data: null,
  error: CommonMessageError.InternalServerError.message,
};
