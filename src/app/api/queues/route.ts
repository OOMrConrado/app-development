import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Queue from "@/models/Queue";

export async function GET() {
  try {
    await dbConnect();
    const queues = await Queue.find().sort({ createdAt: -1 });
    return NextResponse.json(queues);
  } catch {
    return NextResponse.json({ error: "Error al obtener colas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const { name, prefix } = await req.json();

    if (!name || !prefix) {
      return NextResponse.json(
        { error: "Nombre y prefijo son obligatorios" },
        { status: 400 }
      );
    }

    const queue = await Queue.create({
      name,
      prefix: prefix.toUpperCase(),
      createdBy: session.user.id,
    });

    return NextResponse.json(queue, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear cola" }, { status: 500 });
  }
}
