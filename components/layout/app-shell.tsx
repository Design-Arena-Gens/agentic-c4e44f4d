'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { clsx } from "clsx";
import { LogOut, Menu, ShieldAlert } from "lucide-react";
import { primaryNav, adminNav } from "../../lib/navigation";
import { useAuthorization, useCurrentUser } from "../../lib/hooks";
import Button from "../ui/button";
import Badge from "../ui/badge";
import { useAppStore } from "../../store/useAppStore";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const { user, roles } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { can } = useAuthorization();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  const renderNav = () => {
    const items = [...primaryNav, ...adminNav];
    return items
      .filter((item) => !item.permission || can(item.permission))
      .map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-accent/20 text-accent"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
          >
            <span>{item.title}</span>
          </Link>
        );
      });
  };

  return (
    <div className="grid min-h-screen grid-rows-[auto,1fr]">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Expert POS
              </p>
              <h1 className="text-xl font-bold text-slate-100">
                {user.fullName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {roles.map((role) => (
              <Badge key={role.id} tone={role.name === "Super User" ? "danger" : "neutral"}>
                {role.name}
              </Badge>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-[260px,1fr]">
        <aside className="border-r border-slate-800 bg-slate-950/60 px-4 py-6 backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <ShieldAlert className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Active user
              </p>
              <p className="text-sm font-semibold text-slate-100">
                {user.username}
              </p>
            </div>
          </div>
          <nav className="mt-6 flex flex-col gap-1">{renderNav()}</nav>
        </aside>
        <main className="overflow-y-auto bg-slate-950/40 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
