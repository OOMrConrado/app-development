import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Ticket from "@/models/Ticket";
import Queue from "@/models/Queue";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const queueId = searchParams.get("queueId");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (queueId) filter.queue = queueId;
    if (status) filter.status = status;
    if (clientId) filter.client = clientId;

    const tickets = await Ticket.find(filter)
      .populate("queue", "name prefix")
      .populate("client", "name email")
      .populate("attendedBy", "name")
      .sort({ createdAt: 1 });

    return NextResponse.json(tickets);
  } catch {
    return NextResponse.json({ error: "Error al obtener turnos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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

    const queue = await Queue.findById(queueId);
    if (!queue || !queue.isActive) {
      return NextResponse.json(
        { error: "Cola no encontrada o inactiva" },
        { status: 400 }
      );
    }

    // Generar código auto-incremental para hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastTicket = await Ticket.findOne({
      queue: queueId,
      createdAt: { $gte: today },
    }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.code.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    const code = `${queue.prefix}-${String(nextNumber).padStart(3, "0")}`;

    const ticket = await Ticket.create({
      code,
      queue: queueId,
      client: session.user.id,
      status: "waiting",
    });

    const populated = await ticket.populate("queue", "name prefix");

    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear turno" }, { status: 500 });
  }
}
