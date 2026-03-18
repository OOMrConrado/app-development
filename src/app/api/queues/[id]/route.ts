import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Queue from "@/models/Queue";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const queue = await Queue.findByIdAndUpdate(id, body, { new: true });
    if (!queue) {
      return NextResponse.json({ error: "Cola no encontrada" }, { status: 404 });
    }

    return NextResponse.json(queue);
  } catch {
    return NextResponse.json({ error: "Error al actualizar cola" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const queue = await Queue.findByIdAndDelete(id);
    if (!queue) {
      return NextResponse.json({ error: "Cola no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cola eliminada" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar cola" }, { status: 500 });
  }
}
