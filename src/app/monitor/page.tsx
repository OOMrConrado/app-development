"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  _id: string;
  code: string;
  queue: { name: string; prefix: string };
  attendedBy: { name: string } | null;
  attendedAt: string;
}

export default function MonitorPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchAttending = async () => {
      try {
        const res = await fetch("/api/tickets?status=attending");
        const data = await res.json();
        if (Array.isArray(data)) setTickets(data);
      } catch {
        // silently fail on monitor
      }
    };

    fetchAttending();
    const dataInterval = setInterval(fetchAttending, 5000);
    const clockInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Turnos en Atención</h1>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold">
            {time.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-muted-foreground">
            {time.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-3xl text-muted-foreground">
            No hay turnos en atención
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket._id} className="border-2">
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-6xl font-mono font-bold tracking-wider">
                  {ticket.code}
                </p>
                <Badge className="text-lg px-4 py-1">{ticket.queue.name}</Badge>
                {ticket.attendedBy && (
                  <p className="text-lg text-muted-foreground">
                    Atendido por: {ticket.attendedBy.name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-muted-foreground">
          Actualización automática cada 5 segundos
        </p>
      </div>
    </div>
  );
}
