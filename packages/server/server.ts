import express from "express";
import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/shcarDB")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.error("error connecting to mongodb", err);
  });

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello Friend!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
