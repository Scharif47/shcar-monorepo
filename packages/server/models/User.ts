import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    minlength: 3,
    required: true,
  },
  passwordHashed: {
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
  authMethod: {
    type: String,
    enum: ["local", "google"],
    required: true,
  },
  googleId: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  parklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
