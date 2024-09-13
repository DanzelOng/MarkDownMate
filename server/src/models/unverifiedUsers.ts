import mongoose, { Schema, model } from 'mongoose';

const userSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  expiredAt: { type: Date, expires: '60m', default: Date.now },
});

const UnverifiedUser = model('UnverifiedUser', userSchema);

export default UnverifiedUser;
