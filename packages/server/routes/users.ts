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

router.get(
  "/users",
  [check("email").isEmail, check("password").isLength({ min: 5 })],
  getUsers
);
router.get("/user/:id", verifySession, getUser);
router.put("/updateUser/:id", verifySession, verifySelf, updateUser);
router.post("/register", registerUser);
router.post("login", loginUser);
router.post("/logout", verifySession, logoutUser);
router.delete("/deleteUser/:id", verifySession, isAdmin, deleteUser);
router.get("/verify/:token", verifyUser);
router.put("/resetPassword/:id", resetPassword);
router.put("/resetEmail/:id", resetEmail);
router.post("/requestNewVerificationEmail", requestNewVerificationEmail);
