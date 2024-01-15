import { Request, Response, NextFunction } from "express";

const verifySession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "No session, authorization denied" });
  }

  next();
};

export default verifySession;
