import { GlobalResponse } from "@shared/responses";

export const controllerResponse = <T>(
  data: T,
  success: boolean,
  message?: string,
  error?: string
): GlobalResponse<T> => ({
  success,
  data,
  message,
  error,
});
