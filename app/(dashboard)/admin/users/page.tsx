'use client';

import { FormEvent, useMemo, useState } from "react";
import Card from "../../../../components/ui/card";
import Label from "../../../../components/ui/label";
import Input from "../../../../components/ui/input";
import Button from "../../../../components/ui/button";
import Badge from "../../../../components/ui/badge";
import { useAppStore } from "../../../../store/useAppStore";
import { useAuthorization } from "../../../../lib/hooks";
import { Role, User } from "../../../../lib/types";

interface FormState {
  fullName: string;
  username: string;
  password: string;
  roleId?: string;
}

const UsersPage = () => {
  const { can } = useAuthorization();
  const users = useAppStore((state) => state.users);
  const roles = useAppStore((state) => state.roles);
  const userRoles = useAppStore((state) => state.userRoles);
  const createUser = useAppStore((state) => state.createUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const deleteUser = useAppStore((state) => state.deleteUser);
  const assignRoleToUser = useAppStore((state) => state.assignRoleToUser);
  const revokeRoleFromUser = useAppStore((state) => state.revokeRoleFromUser);

  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    username: "",
    password: "",
    roleId: undefined
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const canManageUsers = can("manage_users");

  const usersWithRoles = useMemo(() => {
    return users.map((user) => {
      const relations = userRoles.filter(
        (relation) => relation.userId === user.id
      );
      const assignedRoles = relations
        .map((relation) =>
          roles.find((role) => role.id === relation.roleId)
        )
        .filter((role): role is Role => Boolean(role));
      return { user, roles: assignedRoles };
    });
  }, [roles, userRoles, users]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageUsers) {
      setError("Insufficient permissions.");
      return;
    }
    setError(undefined);
    try {
      const createdUser = createUser({
        fullName: formState.fullName.trim(),
        username: formState.username.trim(),
        password: formState.password,
        active: true,
        isSystem: false
      });
      if (formState.roleId) {
        assignRoleToUser(createdUser.id, formState.roleId);
      }
      setFormState({
        fullName: "",
        username: "",
        password: "",
        roleId: undefined
      });
      setSuccess("User created successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
      setSuccess(undefined);
    }
  };

  const handleToggleActive = (user: User) => {
    if (!canManageUsers) {
      return;
    }
    try {
      updateUser(user.id, { active: !user.active });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDelete = (user: User) => {
    if (!canManageUsers) {
      return;
    }
    try {
      deleteUser(user.id);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleRoleToggle = (userId: string, roleId: string, assigned: boolean) => {
    if (!canManageUsers) {
      return;
    }
    try {
      if (assigned) {
        revokeRoleFromUser(userId, roleId);
      } else {
        assignRoleToUser(userId, roleId);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          User Administration
        </h2>
        <p className="text-sm text-slate-400">
          Maintain operator accounts with Super User safeguards.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-100">
            Create user
          </h3>
          <p className="text-xs text-slate-500">
            New users can be provisioned and role-assigned instantly.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={formState.fullName}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    fullName: event.target.value
                  }))
                }
                disabled={!canManageUsers}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formState.username}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    username: event.target.value
                  }))
                }
                disabled={!canManageUsers}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formState.password}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    password: event.target.value
                  }))
                }
                disabled={!canManageUsers}
              />
            </div>
            <div>
              <Label htmlFor="role">Primary role</Label>
              <select
                id="role"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-100"
                value={formState.roleId ?? ""}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    roleId: event.target.value || undefined
                  }))
                }
                disabled={!canManageUsers}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
                {success}
              </p>
            )}
            <Button type="submit" disabled={!canManageUsers}>
              Create user
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Active accounts
              </h3>
              <p className="text-xs text-slate-500">
                Super User accounts are indestructible and keep all permissions.
              </p>
            </div>
            <Badge tone="neutral">{users.length} users</Badge>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Roles</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersWithRoles.map(({ user, roles: assignedRoles }) => {
                  const isSystem = user.isSystem;
                  const assignedIds = new Set(
                    assignedRoles.map((role) => role.id)
                  );
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-slate-800 text-slate-200"
                    >
                      <td className="px-3 py-3 font-medium">{user.fullName}</td>
                      <td className="px-3 py-3">{user.username}</td>
                      <td className="px-3 py-3">
                        <Badge tone={user.active ? "success" : "danger"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {assignedRoles.length === 0 ? (
                            <span className="text-xs text-slate-500">
                              No roles assigned
                            </span>
                          ) : (
                            assignedRoles.map((role) => (
                              <Badge
                                key={role.id}
                                tone={
                                  role.name === "Super User"
                                    ? "danger"
                                    : "neutral"
                                }
                              >
                                {role.name}
                              </Badge>
                            ))
                          )}
                        </div>
                        {canManageUsers && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {roles.map((role) => {
                              const assigned = assignedIds.has(role.id);
                              const isProtected =
                                role.name === "Super User" && assigned;
                              return (
                                <Button
                                  key={`${user.id}-${role.id}`}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={
                                    isProtected || (!assigned && isSystem)
                                  }
                                  onClick={() =>
                                    handleRoleToggle(user.id, role.id, assigned)
                                  }
                                >
                                  {assigned ? "Remove" : "Assign"} {role.name}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={!canManageUsers || isSystem}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canManageUsers || isSystem}
                            className="text-danger hover:text-danger"
                            onClick={() => handleDelete(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;
