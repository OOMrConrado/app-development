import mongoose, { Schema, models } from "mongoose";

export interface ITicket {
  _id: string;
  code: string;
  queue: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  attendedBy: mongoose.Types.ObjectId | null;
  status: "waiting" | "attending" | "completed" | "cancelled";
  createdAt: Date;
  attendedAt: Date | null;
  completedAt: Date | null;
}

const TicketSchema = new Schema<ITicket>(
  {
    code: { type: String, required: true },
    queue: { type: Schema.Types.ObjectId, ref: "Queue", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attendedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["waiting", "attending", "completed", "cancelled"],
      default: "waiting",
    },
    attendedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);
