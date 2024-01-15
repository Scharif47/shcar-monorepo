import { Request, Response, NextFunction } from "express";

function verifySelf(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.session;
  const { id } = req.params;

  if (String(userId) !== String(id)) {
    return res
      .status(403)
      .json({ error: "You can only update your own profile" });
  }

  next();
}

export default verifySelf;
