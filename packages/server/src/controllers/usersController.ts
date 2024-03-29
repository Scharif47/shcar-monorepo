import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import User from "../models/User";
import { User as UserInterface } from "../types/user";
import sendVerificationEmail from "../services/emailVerification";

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

export const getUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while updating the user",
      });
    }
  }
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { userName, password, email, authMethod, googleId, accessToken } =
    req.body;

  // Validate incoming data
  if (!userName || !password || !email || !authMethod) {
    return res
      .status(400)
      .json({ message: "Missing required registration field" });
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

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + 7); // Token expires in 1 week

    // Create user
    const user = new User({
      userName,
      passwordHashed: authMethod === "local" ? passwordHashed : undefined,
      email,
      authMethod,
      googleId,
      accessToken,
      emailVerificationToken,
      tokenExpiration,
      isVerified: false,
    });
    const newUser = await user.save();

    // Create a session for the user
    req.session.userId = newUser._id.toString();

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.params;

  try {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if the token has expired
    if (user.tokenExpiration && new Date() > user.tokenExpiration) {
      return res.status(400).json({ message: "Token expired" });
    }

    // If the token is valid and not expired, verify the user's email
    user.isVerified = true;
    user.emailVerificationToken = null;
    user.tokenExpiration = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "An unknown error occurred while verifying the email",
      });
    }
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { newPasswort } = req.body;

  try {
    const user = (await User.findById(id)) as UserInterface;

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { newEmail } = req.body;

  try {
    const user = (await User.findById(id)) as UserInterface;

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
    const tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + 7); // Token expires in 1 week

    // Update user's email and set as not verified
    user.email = newEmail;
    user.isVerified = false;
    user.emailVerificationToken = emailVerificationToken;
    user.tokenExpiration = tokenExpiration;
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

export const requestNewVerificationEmail = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate new email verification token
    const emailVerificationToken = uuidv4();
    const tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + 7); // Token expires in 1 week

    user.emailVerificationToken = emailVerificationToken;
    user.tokenExpiration = tokenExpiration;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

    res.json({
      message: "New verification email sent. Please check your inbox.",
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({
        message:
          "An unknown error occurred while sending the verification email",
      });
    }
  }
};
