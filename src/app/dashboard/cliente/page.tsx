"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Queue {
  _id: string;
  name: string;
  prefix: string;
  isActive: boolean;
}

interface Ticket {
  _id: string;
  code: string;
  status: string;
  queue: { _id: string; name: string; prefix: string };
  createdAt: string;
  attendedBy: { name: string } | null;
}

export default function ClientePage() {
  const { data: session } = useSession();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);

  const fetchMyTickets = useCallback(async () => {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/tickets?clientId=${session.user.id}`);
    const data = await res.json();
    if (Array.isArray(data)) setMyTickets(data);
  }, [session?.user?.id]);

  useEffect(() => {
    fetch("/api/queues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQueues(data.filter((q: Queue) => q.isActive));
        }
      });
  }, []);

  useEffect(() => {
    fetchMyTickets();
    const interval = setInterval(fetchMyTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchMyTickets]);

  const takeTicket = async (queueId: string) => {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueId }),
    });

    if (res.ok) {
      const ticket = await res.json();
      toast.success(`Turno ${ticket.code} creado`);
      fetchMyTickets();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const cancelTicket = async (ticketId: string) => {
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (res.ok) {
      toast.success("Turno cancelado");
      fetchMyTickets();
    }
  };

  const statusLabels: Record<string, string> = {
    waiting: "En espera",
    attending: "Atendiendo",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    waiting: "secondary",
    attending: "default",
    completed: "outline",
    cancelled: "destructive",
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTickets = myTickets.filter(
    (t) => new Date(t.createdAt) >= today
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mis Turnos</h1>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sacar Turno</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {queues.map((queue) => (
            <Card key={queue._id}>
              <CardHeader>
                <CardTitle>{queue.name}</CardTitle>
                <CardDescription>Prefijo: {queue.prefix}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => takeTicket(queue._id)}
                >
                  Sacar Turno
                </Button>
              </CardContent>
            </Card>
          ))}
          {queues.length === 0 && (
            <p className="text-muted-foreground col-span-full">
              No hay colas disponibles
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Turnos de Hoy</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cola</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todayTickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell className="font-mono font-bold">
                  {ticket.code}
                </TableCell>
                <TableCell>{ticket.queue.name}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {ticket.status === "waiting" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelTicket(ticket._id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {todayTickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No tenés turnos hoy
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
