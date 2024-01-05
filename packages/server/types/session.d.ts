// types.d.ts
import { Session } from "express-session";
import { Request } from "express";

declare module "express" {
  export interface Request {
    session: Session & {
      userId?: string;
      isAdmin?: boolean;
    };
  }
}
