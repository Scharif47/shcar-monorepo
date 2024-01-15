import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  initialRegistrationDate: {
    type: Date,
    required: true,
  },
  kilometers: {
    type: Number,
    required: true,
  },
  fuelType: {
    type: String,
    enum: ["diesel", "petrol", "hybrid", "electric"],
    required: true,
  },
  enginePower: {
    type: Number,
    required: true,
  },
  engineDisplacement: Number,
  doornumbers: {
    type: Number,
    requerid: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  transmission: {
    type: String,
    enum: ["manual", "automatic"],
    required: true,
  },
  emissionSticker: {
    type: String,
    enum: ["none", "red", "yellow", "green"],
    required: true,
  },
  emmisionClass: {
    type: String,
    enum: ["euro1", "euro2", "euro3", "euro4", "euro5", "euro6"],
    required: true,
  },
  airConditioning: {
    type: String,
    enum: ["manual", "automatic"],
  },
  parksystem: [
    {
      type: String,
      enum: ["front", "back", "camera", "360° camera", "autonomous"],
    },
  ],
  airbags: [
    {
      type: String,
      enum: ["front", "side", "others"],
    },
  ],
  color: {
    type: String,
    required: true,
  },
  mainInspection: String,
  description: String,
  fuelConsumption: String,
  co2Emissions: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Car = mongoose.model("Car", carSchema);

export default Car;
