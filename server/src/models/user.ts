import mongoose, { Schema, model, Types } from 'mongoose';

export interface IUser {
  userId: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  resetToken: string;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;
