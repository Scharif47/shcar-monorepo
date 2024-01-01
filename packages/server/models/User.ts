import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    minlength: 3,
    required: true,
  },
  authMethod: {
    type: String,
    enum: ["local", "google"],
    required: true,
  },
  passwordHash: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: (props: { value: string }) =>
        `${props.value} is not a valid email!`,
    },
  },
  googleId: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  cars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
  parklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
