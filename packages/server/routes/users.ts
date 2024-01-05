import express from "express";
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
} from "../controllers/usersController";

const router = express.Router();

router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.put("/updateUser", updateUser);
router.post("/register", registerUser);
router.post("login", loginUser);
router.post("/logout", logoutUser);
router.delete("/deleteUser/:id", deleteUser);
router.post("/verifvyUser", verifyUser);
router.put("/resetPassword", resetPassword);
router.put("/resetEmail", resetEmail);
