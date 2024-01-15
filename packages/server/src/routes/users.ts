import express from "express";
import { check } from "express-validator";
import {
  getUsers,
  getUser,
  updateUser,
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  verifyUser,
  resetPassword,
  resetEmail,
  requestNewVerificationEmail,
} from "../controllers/usersController";
import verifySession from "../middlewares/verifySession";
import verifySelf from "../middlewares/verifySelf";
import isAdmin from "../middlewares/isAdmin";

const router = express.Router();

router.get("/users", getUsers);

router.get("/user/:id", [verifySession, check("id").isMongoId()], getUser);

router.put(
  "/updateUser/:id",
  [
    verifySession,
    verifySelf,
    check("id").isMongoId(),
    check("email").optional().isEmail(),
    check("password").optional().isLength({ min: 5 }),
  ],
  updateUser
);

router.post(
  "/register",
  [
    check("userName").notEmpty(),
    check("password").isLength({ min: 5 }),
    check("email").isEmail(),
    check("authMethod").notEmpty(),
  ],
  registerUser
);

router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 5 })],
  loginUser
);

router.post("/logout", [verifySession], logoutUser);

router.delete(
  "/deleteUser/:id",
  [verifySession, isAdmin, check("id").isMongoId()],
  deleteUser
);

router.get("/verify/:token", [check("token").notEmpty()], verifyUser);

router.put(
  "/resetPassword/:id",
  [check("id").isMongoId(), check("password").isLength({ min: 5 })],
  resetPassword
);

router.put(
  "/resetEmail/:id",
  [check("id").isMongoId(), check("email").isEmail()],
  resetEmail
);

router.post(
  "/requestNewVerificationEmail",
  [check("email").isEmail()],
  requestNewVerificationEmail
);
