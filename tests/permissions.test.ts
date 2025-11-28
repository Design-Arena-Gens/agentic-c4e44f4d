import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "../store/useAppStore";
import { PermissionKey } from "../lib/types";

const loginAs = (username: string, password: string) => {
  const { login } = useAppStore.getState();
  login(username, password);
};

const logout = () => {
  const { logout } = useAppStore.getState();
  logout();
};

const expectPermission = (permission: PermissionKey, value: boolean) => {
  const { hasPermission } = useAppStore.getState();
  expect(hasPermission(permission)).toBe(value);
};

beforeEach(() => {
  const { reset, logout } = useAppStore.getState();
  reset();
  logout();
});

describe("role-based access control", () => {
  it("grants every permission to super user accounts", () => {
    loginAs("supervisor", "supervisor@123");
    const allPermissions: PermissionKey[] = [
      "manage_users",
      "manage_roles",
      "manage_permissions",
      "manage_products",
      "view_inventory",
      "record_sale",
      "edit_sale",
      "delete_sale",
      "record_purchase",
      "view_reports"
    ];
    allPermissions.forEach((permission) =>
      expectPermission(permission, true)
    );
    logout();
  });

  it("restricts cashiers from editing catalog or deleting sales", () => {
    loginAs("cora.cashier", "cashier@123");
    expectPermission("record_sale", true);
    expectPermission("view_inventory", true);
    expectPermission("manage_products", false);
    expectPermission("delete_sale", false);
  });

  it("prevents cashier role from receiving prohibited permissions", () => {
    loginAs("supervisor", "supervisor@123");
    const { roles, setRolePermissions } = useAppStore.getState();
    const cashierRole = roles.find((role) => role.name === "Cashier");
    expect(cashierRole).toBeDefined();
    if (!cashierRole) {
      throw new Error("Missing cashier role");
    }
    expect(() =>
      setRolePermissions(cashierRole.id, [
        "record_sale",
        "manage_products"
      ])
    ).toThrow(/Cashier role cannot receive elevated permissions/);
  });
});
