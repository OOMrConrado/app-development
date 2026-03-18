import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    const validTransitions: Record<string, string[]> = {
      waiting: ["cancelled"],
      attending: ["completed", "cancelled"],
    };

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    }

    const allowed = validTransitions[ticket.status];
    if (!allowed || !allowed.includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${ticket.status} a ${status}` },
        { status: 400 }
      );
    }

    ticket.status = status;
    if (status === "completed" || status === "cancelled") {
      ticket.completedAt = new Date();
    }

    await ticket.save();

    const updated = await Ticket.findById(id)
      .populate("queue", "name prefix")
      .populate("client", "name email")
      .populate("attendedBy", "name");

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar turno" },
      { status: 500 }
    );
  }
}
