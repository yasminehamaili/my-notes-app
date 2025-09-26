import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: 'user',
      trim: true,
      maxLength: 50
    },
    profileImage: {
      type: String,
      default: '/images/user.png'
    },
    notes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }],
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
