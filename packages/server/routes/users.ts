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
import verifySession from "../middlewares/verifySession";
import verifySelf from "../middlewares/verifySelf";
import isAdmin from "../middlewares/isAdmin";

const router = express.Router();

router.get("/users", getUsers);
router.get("/user/:id", verifySession, getUser);
router.put("/updateUser", verifySession, verifySelf, updateUser);
router.post("/register", registerUser);
router.post("login", loginUser);
router.post("/logout", verifySession, logoutUser);
router.delete("/deleteUser/:id", verifySession, isAdmin, deleteUser);
router.post("/verifvyUser", verifyUser);
router.put("/resetPassword", resetPassword);
router.put("/resetEmail", resetEmail);
