"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  createdAt: string;
}

export default function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [open, setOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);

  const fetchQueues = async () => {
    const res = await fetch("/api/queues");
    const data = await res.json();
    if (Array.isArray(data)) setQueues(data);
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/queues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prefix }),
    });

    if (res.ok) {
      toast.success("Cola creada");
      setName("");
      setPrefix("");
      setOpen(false);
      fetchQueues();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const handleUpdate = async () => {
    if (!editingQueue) return;
    const res = await fetch(`/api/queues/${editingQueue._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prefix }),
    });

    if (res.ok) {
      toast.success("Cola actualizada");
      setEditingQueue(null);
      setName("");
      setPrefix("");
      fetchQueues();
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const toggleActive = async (queue: Queue) => {
    await fetch(`/api/queues/${queue._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !queue.isActive }),
    });
    fetchQueues();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/queues/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Cola eliminada");
      fetchQueues();
    }
  };

  const openEdit = (queue: Queue) => {
    setEditingQueue(queue);
    setName(queue.name);
    setPrefix(queue.prefix);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Colas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Nueva Cola</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Cola</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Caja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Prefijo (máx 3 caracteres)</Label>
                <Input
                  placeholder="Ej: C"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {editingQueue && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editando: {editingQueue.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prefijo</Label>
                <Input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Guardar</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingQueue(null);
                  setName("");
                  setPrefix("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Prefijo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queues.map((queue) => (
            <TableRow key={queue._id}>
              <TableCell className="font-medium">{queue.name}</TableCell>
              <TableCell>{queue.prefix}</TableCell>
              <TableCell>
                <Badge variant={queue.isActive ? "default" : "secondary"}>
                  {queue.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(queue)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(queue)}
                  >
                    {queue.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(queue._id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {queues.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No hay colas creadas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
