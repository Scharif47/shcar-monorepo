import express from "express";

import {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} from "../controllers/carsController";
import verifySession from "../middlewares/verifySession";
import isAdmin from "../middlewares/isAdmin";

const router = express.Router();

router.get("/cars", getCars);
router.get("/car/:id", getCar);
router.post("/createCar", verifySession, isAdmin, createCar);
router.put("/updateCar/:id", verifySession, isAdmin, updateCar);
router.delete("/deleteCar/:id", verifySession, isAdmin, deleteCar);
