'use client';

import { format } from "date-fns";
import Card from "../../components/ui/card";
import Badge from "../../components/ui/badge";
import Button from "../../components/ui/button";
import { useAppStore } from "../../store/useAppStore";
import { useAuditLog, useCurrentUser } from "../../lib/hooks";

const DashboardPage = () => {
  const sales = useAppStore((state) => state.sales);
  const purchases = useAppStore((state) => state.purchases);
  const products = useAppStore((state) => state.products);
  const sessions = useAppStore((state) => state.sessions);
  const auditLog = useAuditLog();
  const { user } = useCurrentUser();

  const activeSession = sessions
    .slice()
    .reverse()
    .find((session) => session.userId === user?.id && !session.logoutAt);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-100">
            Operational Control Center
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Monitor real-time sales, purchases, and inventory activity.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>Session started</p>
          <p className="font-medium text-slate-300">
            {activeSession
              ? format(new Date(activeSession.loginAt), "PPpp")
              : "No active session"}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Sales recorded
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            {sales.length}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Username stored for each transaction
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Purchases logged
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            {purchases.length}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Timestamped replenishment history
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Inventory items
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            {products.filter((product) => !product.isArchived).length}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Cashier edits automatically locked
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Audit entries
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            {auditLog.length}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Comprehensive change history
          </p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Recent Activity
              </h3>
              <p className="text-xs text-slate-500">
                Permission-secured log of sensitive actions.
              </p>
            </div>
            <Badge tone="neutral">{auditLog.length} records</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {auditLog.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <p className="text-sm text-slate-200">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {format(new Date(item.occurredAt), "PPpp")}
                </p>
              </div>
            ))}
            {auditLog.length === 0 && (
              <p className="text-sm text-slate-500">
                No audit records yet. Actions such as login, role updates, and
                transactions populate the trail.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-slate-100">
            Quick Guidance
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Accelerate operations with pre-modeled user roles.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <strong className="text-slate-100">Super User</strong> — Full
              platform control. Cannot be deleted or restricted.
            </li>
            <li>
              <strong className="text-slate-100">Admin</strong> — Manage users,
              catalog, and sales with granular restrictions.
            </li>
            <li>
              <strong className="text-slate-100">Normal User</strong> — Rich
              reporting and stock oversight without destructive permissions.
            </li>
            <li>
              <strong className="text-slate-100">Cashier</strong> — Guided POS
              workflow without catalog editing or sale deletion rights.
            </li>
          </ul>
          <Button
            variant="ghost"
            className="mt-6 w-full"
            onClick={() => window.open("https://agentic-c4e44f4d.vercel.app", "_blank")}
          >
            Production URL
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
