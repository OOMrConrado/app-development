"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalQueues: number;
  activeQueues: number;
  todayTickets: number;
  waitingTickets: number;
  attendingTickets: number;
  completedTickets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQueues: 0,
    activeQueues: 0,
    todayTickets: 0,
    waitingTickets: 0,
    attendingTickets: 0,
    completedTickets: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [queuesRes, ticketsRes] = await Promise.all([
        fetch("/api/queues"),
        fetch("/api/tickets"),
      ]);
      const queues = await queuesRes.json();
      const tickets = await ticketsRes.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayTickets = Array.isArray(tickets)
        ? tickets.filter((t: { createdAt: string }) => new Date(t.createdAt) >= today)
        : [];

      setStats({
        totalQueues: Array.isArray(queues) ? queues.length : 0,
        activeQueues: Array.isArray(queues)
          ? queues.filter((q: { isActive: boolean }) => q.isActive).length
          : 0,
        todayTickets: todayTickets.length,
        waitingTickets: todayTickets.filter((t: { status: string }) => t.status === "waiting").length,
        attendingTickets: todayTickets.filter((t: { status: string }) => t.status === "attending").length,
        completedTickets: todayTickets.filter((t: { status: string }) => t.status === "completed").length,
      });
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Colas Totales", value: stats.totalQueues },
    { title: "Colas Activas", value: stats.activeQueues },
    { title: "Turnos Hoy", value: stats.todayTickets },
    { title: "En Espera", value: stats.waitingTickets },
    { title: "Atendiendo", value: stats.attendingTickets },
    { title: "Completados", value: stats.completedTickets },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
