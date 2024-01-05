import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "User is not an admin" });
    }

    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while checking user permissions",
      });
    }
  }
};

export default isAdmin;