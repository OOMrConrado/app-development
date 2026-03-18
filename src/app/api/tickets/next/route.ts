import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "operador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const { queueId } = await req.json();

    if (!queueId) {
      return NextResponse.json(
        { error: "ID de cola es obligatorio" },
        { status: 400 }
      );
    }

    // Buscar el ticket más antiguo en espera de esta cola
    const ticket = await Ticket.findOneAndUpdate(
      { queue: queueId, status: "waiting" },
      {
        status: "attending",
        attendedBy: session.user.id,
        attendedAt: new Date(),
      },
      { new: true, sort: { createdAt: 1 } }
    )
      .populate("queue", "name prefix")
      .populate("client", "name email")
      .populate("attendedBy", "name");

    if (!ticket) {
      return NextResponse.json(
        { error: "No hay turnos en espera" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "Error al llamar siguiente turno" },
      { status: 500 }
    );
  }
}
