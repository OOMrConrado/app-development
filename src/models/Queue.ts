import mongoose, { Schema, models } from "mongoose";

export interface IQueue {
  _id: string;
  name: string;
  prefix: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QueueSchema = new Schema<IQueue>(
  {
    name: { type: String, required: true },
    prefix: { type: String, required: true, maxlength: 3 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default models.Queue || mongoose.model<IQueue>("Queue", QueueSchema);
