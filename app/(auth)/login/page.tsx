'use client';

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/button";
import Card from "../../../components/ui/card";
import Input from "../../../components/ui/input";
import Label from "../../../components/ui/label";
import { useAppStore } from "../../../store/useAppStore";

const LoginPage = () => {
  const login = useAppStore((state) => state.login);
  const initialized = useAppStore((state) => state.initialized);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (currentUserId) {
      router.replace("/");
    }
  }, [currentUserId, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    try {
      login(username.trim(), password);
      router.replace("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-accent/80">
            Expert POS
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">
            Secure Operator Login
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Role-aware access with complete audit trails.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="e.g. supervisor"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              hasError={Boolean(error)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hasError={Boolean(error)}
              required
            />
          </div>
          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={!initialized || !username || !password}
          >
            Sign In
          </Button>
          <div className="text-xs text-slate-500">
            <p className="font-mono">
              supervisor / supervisor@123
            </p>
            <p className="font-mono">
              amy.admin / admin@123
            </p>
            <p className="font-mono">
              nick.normal / normal@123
            </p>
            <p className="font-mono">
              cora.cashier / cashier@123
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
