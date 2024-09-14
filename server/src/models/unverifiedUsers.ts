import mongoose, { Schema, model, Types } from 'mongoose';

export interface IUser {
  userId: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  expireAt: Date;
}

const userSchema = new Schema<IUser>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expireAt: { type: Date, expires: '60m', default: Date.now },
});

const UnverifiedUser = model('UnverifiedUser', userSchema);

export default UnverifiedUser;
