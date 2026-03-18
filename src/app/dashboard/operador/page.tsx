"use client";

import { useEffect, useState, useCallback } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  client: { name: string; email: string };
  attendedBy: { name: string } | null;
  createdAt: string;
}

export default function OperadorPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);

  useEffect(() => {
    fetch("/api/queues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQueues(data.filter((q: Queue) => q.isActive));
        }
      });
  }, []);

  const fetchWaiting = useCallback(async () => {
    if (!selectedQueue) return;
    const res = await fetch(
      `/api/tickets?queueId=${selectedQueue}&status=waiting`
    );
    const data = await res.json();
    if (Array.isArray(data)) setWaitingCount(data.length);
  }, [selectedQueue]);

  const fetchCurrentTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets?status=attending`);
    const data = await res.json();
    if (Array.isArray(data)) {
      const myTicket = data.find(
        (t: Ticket) =>
          selectedQueue && t.queue._id === selectedQueue
      );
      setCurrentTicket(myTicket || null);
    }
  }, [selectedQueue]);

  useEffect(() => {
    if (selectedQueue) {
      fetchWaiting();
      fetchCurrentTicket();
      const interval = setInterval(() => {
        fetchWaiting();
        fetchCurrentTicket();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedQueue, fetchWaiting, fetchCurrentTicket]);

  const callNext = async () => {
    const res = await fetch("/api/tickets/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueId: selectedQueue }),
    });

    if (res.ok) {
      const ticket = await res.json();
      setCurrentTicket(ticket);
      toast.success(`Llamando turno ${ticket.code}`);
      fetchWaiting();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const updateTicket = async (status: string) => {
    if (!currentTicket) return;
    const res = await fetch(`/api/tickets/${currentTicket._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success(
        status === "completed" ? "Turno completado" : "Turno cancelado"
      );
      setCurrentTicket(null);
      fetchWaiting();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Atención de Turnos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Cola</CardTitle>
          <CardDescription>Elegí la cola que vas a atender</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedQueue} onValueChange={(value) => setSelectedQueue(value ?? "")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Seleccionar cola..." />
            </SelectTrigger>
            <SelectContent>
              {queues.map((queue) => (
                <SelectItem key={queue._id} value={queue._id}>
                  {queue.name} ({queue.prefix})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedQueue && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  En Espera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{waitingCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Turno Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {currentTicket?.code || "---"}
                </p>
              </CardContent>
            </Card>
          </div>

          {currentTicket ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  Atendiendo: {currentTicket.code}
                  <Badge>En atención</Badge>
                </CardTitle>
                <CardDescription>
                  Cliente: {currentTicket.client.name} ({currentTicket.client.email})
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button onClick={() => updateTicket("completed")}>
                  Completar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateTicket("cancelled")}
                >
                  Cancelar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Button
              size="lg"
              className="w-full py-8 text-lg"
              onClick={callNext}
              disabled={waitingCount === 0}
            >
              Llamar Siguiente Turno
            </Button>
          )}
        </>
      )}
    </div>
  );
}
