"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const adminLinks = [
  { href: "/dashboard/admin", label: "Panel" },
  { href: "/dashboard/admin/queues", label: "Colas" },
  { href: "/dashboard/admin/users", label: "Usuarios" },
];

const operadorLinks = [
  { href: "/dashboard/operador", label: "Atención" },
];

const clienteLinks = [
  { href: "/dashboard/cliente", label: "Mis Turnos" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const links =
    role === "admin"
      ? adminLinks
      : role === "operador"
      ? operadorLinks
      : clienteLinks;

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    operador: "Operador",
    cliente: "Cliente",
  };

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold">
          Turnero
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-4 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/monitor"
          className="block px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Monitor
        </Link>
      </nav>
      <Separator />
      <div className="p-4 space-y-3">
        <div className="px-4">
          <p className="text-sm font-medium truncate">{session?.user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {role && roleLabels[role]}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
