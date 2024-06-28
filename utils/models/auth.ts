import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name"],
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email"],
      unique: true,
    },
    password: {
      type: String,
    },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model<UserDocument>("user", userSchema);

export default User;
