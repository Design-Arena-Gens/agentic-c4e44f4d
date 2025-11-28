'use client';

import { FormEvent, useMemo, useState } from "react";
import Card from "../../../../components/ui/card";
import Label from "../../../../components/ui/label";
import Input from "../../../../components/ui/input";
import Button from "../../../../components/ui/button";
import Badge from "../../../../components/ui/badge";
import { useAppStore } from "../../../../store/useAppStore";
import { useAuthorization } from "../../../../lib/hooks";
import { Permission, PermissionKey, Role } from "../../../../lib/types";

interface RoleFormState {
  name: string;
  description: string;
}

const RolesPage = () => {
  const { can } = useAuthorization();
  const roles = useAppStore((state) => state.roles);
  const permissions = useAppStore((state) => state.permissions);
  const rolePermissions = useAppStore((state) => state.rolePermissions);
  const createRole = useAppStore((state) => state.createRole);
  const deleteRole = useAppStore((state) => state.deleteRole);
  const setRolePermissions = useAppStore((state) => state.setRolePermissions);

  const canManageRoles = can("manage_roles");
  const canManagePermissions = can("manage_permissions");

  const [formState, setFormState] = useState<RoleFormState>({
    name: "",
    description: ""
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const permissionsByRole = useMemo(() => {
    return roles.reduce<Record<string, Permission[]>>((acc, role) => {
      const assigned = rolePermissions
        .filter((relation) => relation.roleId === role.id)
        .map((relation) =>
          permissions.find(
            (permission) => permission.id === relation.permissionId
          )
        )
        .filter((permission): permission is Permission => Boolean(permission));
      acc[role.id] = assigned;
      return acc;
    }, {});
  }, [permissions, rolePermissions, roles]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageRoles) {
      setError("Insufficient permissions.");
      return;
    }
    try {
      createRole({
        name: formState.name.trim(),
        description: formState.description.trim(),
        isSystem: false
      });
      setFormState({ name: "", description: "" });
      setSuccess("Role created successfully.");
      setError(undefined);
    } catch (err) {
      setSuccess(undefined);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
    }
  };

  const handleTogglePermission = (
    role: Role,
    permissionKey: PermissionKey,
    assigned: boolean
  ) => {
    if (!canManagePermissions) {
      return;
    }
    const rolePermissionKeys =
      permissionsByRole[role.id]?.map((permission) => permission.key) ?? [];
    const nextKeys = assigned
      ? rolePermissionKeys.filter((key) => key !== permissionKey)
      : [...rolePermissionKeys, permissionKey];
    try {
      setRolePermissions(role.id, nextKeys);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (!canManageRoles) {
      return;
    }
    try {
      deleteRole(roleId);
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
          Roles & Permissions
        </h2>
        <p className="text-sm text-slate-400">
          Configure security profiles with fine-grained control. Super Users
          always retain full access.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-100">Create role</h3>
          <p className="text-xs text-slate-500">
            Model reusable permission bundles tailored to your operations.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: event.target.value
                  }))
                }
                disabled={!canManageRoles}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: event.target.value
                  }))
                }
                disabled={!canManageRoles}
              />
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
            <Button type="submit" disabled={!canManageRoles}>
              Create role
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Role catalogue
              </h3>
              <p className="text-xs text-slate-500">
                Assign or revoke permissions per role. Super User is immutable.
              </p>
            </div>
            <Badge tone="neutral">{roles.length} roles</Badge>
          </div>
          <div className="mt-4 space-y-4">
            {roles.map((role) => {
              const assigned = permissionsByRole[role.id] ?? [];
              const assignedKeys = new Set(
                assigned.map((permission) => permission.key)
              );
              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-100">
                        {role.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={role.name === "Super User" ? "danger" : "neutral"}
                      >
                        {role.isSystem ? "System" : "Custom"}
                      </Badge>
                      <Badge tone="success">
                        {assigned.length} perms
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assigned.length === 0 ? (
                      <span className="text-xs text-slate-500">
                        No permissions assigned.
                      </span>
                    ) : (
                      assigned.map((permission) => (
                        <Badge key={permission.id} tone="neutral">
                          {permission.name}
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    {permissions.map((permission) => {
                      const isAssigned = assignedKeys.has(permission.key);
                      return (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {permission.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {permission.description}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant={isAssigned ? "secondary" : "ghost"}
                            size="sm"
                            disabled={
                              !canManagePermissions ||
                              role.name === "Super User"
                            }
                            onClick={() =>
                              handleTogglePermission(
                                role,
                                permission.key,
                                isAssigned
                              )
                            }
                          >
                            {isAssigned ? "Revoke" : "Grant"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  {!role.isSystem && role.name !== "Super User" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-danger hover:text-danger"
                      disabled={!canManageRoles}
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      Delete role
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RolesPage;
