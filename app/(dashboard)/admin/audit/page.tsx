'use client';

import { format } from "date-fns";
import Card from "../../../../components/ui/card";
import Badge from "../../../../components/ui/badge";
import { useAppStore } from "../../../../store/useAppStore";
import { useAuditLog } from "../../../../lib/hooks";

const AuditPage = () => {
  const sessions = useAppStore((state) => state.sessions);
  const auditLog = useAuditLog();
  const users = useAppStore((state) => state.users);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          Audit & Sessions
        </h2>
        <p className="text-sm text-slate-400">
          Evidence-grade audit trail covering authentication events and
          privileged actions.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Login sessions
              </h3>
              <p className="text-xs text-slate-500">
                Track who accessed the system and for how long.
              </p>
            </div>
            <Badge tone="neutral">{sessions.length} entries</Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {sessions
              .slice()
              .sort((a, b) =>
                a.loginAt > b.loginAt ? -1 : a.loginAt < b.loginAt ? 1 : 0
              )
              .map((session) => {
                const user = users.find((candidate) => candidate.id === session.userId);
                return (
                  <div
                    key={session.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-100">
                        {session.username}
                      </p>
                      <Badge tone={session.logoutAt ? "neutral" : "success"}>
                        {session.logoutAt ? "Closed" : "Active"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Login: {format(new Date(session.loginAt), "PPpp")}
                    </p>
                    <p className="text-xs text-slate-500">
                      Logout:{" "}
                      {session.logoutAt
                        ? format(new Date(session.logoutAt), "PPpp")
                        : "Active"}
                    </p>
                    {user && (
                      <p className="mt-2 text-xs text-slate-500">
                        Full name: {user.fullName}
                      </p>
                    )}
                  </div>
                );
              })}
            {sessions.length === 0 && (
              <p className="text-sm text-slate-500">
                No login sessions recorded yet.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Audit log
              </h3>
              <p className="text-xs text-slate-500">
                Immutable action trail for regulator-ready reporting.
              </p>
            </div>
            <Badge tone="neutral">{auditLog.length} events</Badge>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {auditLog.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3"
              >
                <p className="font-semibold text-slate-100">
                  {entry.message}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {format(new Date(entry.occurredAt), "PPpp")}
                </p>
              </div>
            ))}
            {auditLog.length === 0 && (
              <p className="text-sm text-slate-500">
                Audit log empty. Operational actions populate this space.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditPage;
