import { Schema, model } from 'mongoose';

const markdownSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    fileName: { type: String, required: true },
    content: { type: String },
  },
  { timestamps: true }
);

const Markdown = model('Markdown', markdownSchema);

export default Markdown;
