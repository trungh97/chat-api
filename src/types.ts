import { User } from "@domain/entities";
import { Request, Response } from "express";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

export type Context = {
  req: Request & { session: session.Session & Partial<session.SessionData> };
  res: Response;
};
