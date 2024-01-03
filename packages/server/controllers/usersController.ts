import { Request, Response } from "express";
import { SessionData } from "express-session";
import User from "../models/User";
import { User as UserInterface } from "../types/user";
import bcrypt from "bcrypt";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while fetching the users",
      });
    }
  }
};

export const createUser = async (
  req: Request & { session: SessionData },
  res: Response
) => {
  const { userName, password, email, authMethod, googleId, accessToken } =
    req.body;

  // Validate incoming data
  if (!userName || !password || !email || !authMethod) {
    return res
      .status(400)
      .json({ message: "Missing required regiistration field" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already taken" });
    }

    // Hash password if authMethod is local
    let passwordHashed = "";
    if (authMethod === "local") {
      const saltRound = 10;
      passwordHashed = await bcrypt.hash(password, saltRound);
    }

    // Create user
    const user = new User({
      userName,
      passwordHashed,
      email,
      authMethod,
      googleId,
      accessToken,
    });
    const newUser = await user.save();

    // Create a session for the user
    req.session.userId = newUser._id.toString();

    res.status(201).json(newUser);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while creating the user",
      });
    }
  }
};

export const loginUser = async (
  req: Request & { session: SessionData },
  res: Response
) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Missing required login field" });
  }

  try {
    const user = (await User.findOne({ userName })) as UserInterface;

    !user && res.status(400).json({ message: "Invalid credentials" });

    const passwordMatch = await bcrypt.compare(password, user.passwordHashed);
    !passwordMatch && res.status(400).json({ message: "Invalid credentials" });

    req.session.userId = user._id.toString();
    res.json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while logging in the user",
      });
    }
  }
};
