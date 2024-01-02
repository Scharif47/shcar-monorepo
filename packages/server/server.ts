import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect("mongodb://localhost:27017/shcarDB")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.error("error connecting to mongodb", err);
  });

const MongoDBStoreSession = MongoDBStore(session);
const store = new MongoDBStoreSession({
  uri: "mongodb://localhost:27017/shcarDB",
  collection: "mySessions",
});

const app = express();
const port = process.env.PORT || 3000;

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is not set");
}

app.use(
  session({
    secret: sessionSecret,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("Hello Friend!" + JSON.stringify(req.session));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
