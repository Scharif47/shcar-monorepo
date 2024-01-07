import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import User from "../models/User";
import { User as UserInterface } from "../types/user";
import sendVerificationEmail from "../services/emailVerification";

export const getUsers = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.session;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = (await User.findById(userId)) as UserInterface;
    res.json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred while fetching the user" });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.session;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updates = req.body;

  try {
    const user = (await User.findByIdAndUpdate(userId, updates, {
      new: true,
    })) as UserInterface;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred while updating the user" });
    }
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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
      passwordHashed: authMethod === "local" ? passwordHashed : undefined,
      email,
      authMethod,
      googleId,
      accessToken,
    });
    const newUser = await user.save();

    // Create a session for the user
    req.session.userId = newUser._id.toString();

    res.status(201).json({
      id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
    });
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

export const loginUser = async (req: Request, res: Response) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Missing required login field" });
  }

  try {
    const user = (await User.findOne({ userName })) as UserInterface;

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHashed);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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

export const logoutUser = async (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: `Error logging out: ${err.message}` });
      }

      res.json({ message: "User logged out successfully" });
    });
  } else {
    res.status(400).json({ message: "No active session to log out from" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while deleting the user",
      });
    }
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = (await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    )) as UserInterface;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.json({ message: "User verified successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while verifying the user",
      });
    }
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPasswort } = req.body;

  try {
    const user = (await User.findOne({ email })) as UserInterface;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPasswort, salt);

    // Update user's password
    user.passwordHashed = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while resetting the password",
      });
    }
  }
};

export const resetEmail = async (req: Request, res: Response) => {
  const { email, newEmail } = req.body;

  try {
    const user = (await User.findOne({ email })) as UserInterface;

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if new email is already taken
    const emailExists = await User.findOne({ email: newEmail });

    if (emailExists) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    // Update user's email and set as not verified
    user.email = newEmail;
    user.isVerified = false;
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Send verification email to new email
    await sendVerificationEmail(user.email, emailVerificationToken);
    res.json({
      message: "Verification email sent. Please verify your new email.",
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while resetting the email",
      });
    }
  }
};
