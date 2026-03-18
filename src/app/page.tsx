"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Turnero</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Sistema de gestión de turnos para atención al público
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg">Iniciar Sesión</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="lg">
            Registrarse
          </Button>
        </Link>
      </div>
      <Link href="/monitor">
        <Button variant="link" className="text-muted-foreground">
          Ver pantalla de turnos
        </Button>
      </Link>
    </div>
  );
}
