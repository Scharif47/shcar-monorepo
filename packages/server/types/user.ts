import { Document, Schema } from "mongoose";

export interface User extends Document {
  userName: string;
  passwordHashed: string;
  email: string;
  authMethod: string;
  googleId?: string;
  accessToken?: string;
  isAdmin: boolean;
  isVerified: boolean;
  emailVerificationToken?: string;
  parklist?: Schema.Types.ObjectId[];
}
