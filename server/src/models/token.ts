import { Schema, model } from 'mongoose';

const tokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  expiredAt: { type: Date, expires: '5m', default: Date.now },
});

const ResetToken = model('token', tokenSchema);

export default ResetToken;
