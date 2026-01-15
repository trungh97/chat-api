import { UnauthorizedResponse } from "@shared/responses";
import { MiddlewareFn } from "type-graphql";
import { Context } from "types";

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw UnauthorizedResponse;
  }

  return next();
};
