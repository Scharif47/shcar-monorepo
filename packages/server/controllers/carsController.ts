import { Request, Response } from "express";
import Car from "../models/Car";

export const getCars = async (req: Request, res: Response) => {
  try {
    const cars = await Car.find();
    res.send(cars);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send({ message: "Car not found" });
    }

    res.send(car);
  } catch (err) {
    res.status(500).send(err);
  }
};

export const createCar = async (req: Request, res: Response) => {
  const car = new Car(req.body);
  try {
    await car.save();
    res.status(201).send(car);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const updateCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return res.status(404).send({ message: "Car not found" });
    }

    res.send(car);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(404).send({ message: "Car not found" });
    }

    res.send(car);
  } catch (err) {
    res.status(500).send(err);
  }
};
