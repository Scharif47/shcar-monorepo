import { Session } from "express-session";
import { Request } from "express";
import { User } from "./user";

declare module "express" {
  export interface Request {
    session: Session & {
      userId?: string;
      isAdmin?: boolean;
      user?: { [key: string]: User };
    };
  }
}
