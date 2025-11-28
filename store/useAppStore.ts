import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { formatISO } from "date-fns";
import { nanoid } from "nanoid";
import {
  AuditLog,
  Permission,
  PermissionKey,
  Product,
  Purchase,
  PurchaseItem,
  Role,
  RolePermission,
  Sale,
  SaleItem,
  User,
  UserRole,
  UserSession
} from "../lib/types";
import { buildSeedData } from "../lib/seed";

export interface AppStoreState {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  userRoles: UserRole[];
  rolePermissions: RolePermission[];
  sessions: UserSession[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  auditLog: AuditLog[];
  currentUserId?: string;
  initialized: boolean;
  initialize: () => void;
  reset: () => void;
  login: (username: string, password: string) => void;
  logout: () => void;
  hasPermission: (permission: PermissionKey) => boolean;
  assignRoleToUser: (userId: string, roleId: string) => void;
  revokeRoleFromUser: (userId: string, roleId: string) => void;
  createUser: (
    payload: Omit<User, "id" | "isSystem"> & { isSystem?: boolean }
  ) => User;
  updateUser: (userId: string, input: Partial<Omit<User, "id">>) => void;
  deleteUser: (userId: string) => void;
  createRole: (payload: Omit<Role, "id">) => void;
  updateRole: (roleId: string, input: Partial<Omit<Role, "id">>) => void;
  deleteRole: (roleId: string) => void;
  setRolePermissions: (roleId: string, permissionKeys: PermissionKey[]) => void;
  upsertProduct: (product: Omit<Product, "id"> & { id?: string }) => void;
  archiveProduct: (productId: string) => void;
  recordSale: (input: { items: Array<Omit<SaleItem, "productName">>; reference?: string }) => Sale;
  recordPurchase: (input: {
    items: Array<Omit<PurchaseItem, "productName">>;
    reference?: string;
  }) => Purchase;
  deleteSale: (saleId: string) => void;
}

const selectUser = (state: AppStoreState) =>
  state.currentUserId
    ? state.users.find((user) => user.id === state.currentUserId)
    : undefined;

const ensurePermission = (state: AppStoreState, permission: PermissionKey) => {
  if (!state.hasPermission(permission)) {
    throw new Error("Insufficient permissions for this operation.");
  }
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      roles: [],
      permissions: [],
      userRoles: [],
      rolePermissions: [],
      sessions: [],
      products: [],
      sales: [],
      purchases: [],
      auditLog: [],
      currentUserId: undefined,
      initialized: false,
      initialize: () => {
        if (get().initialized) {
          return;
        }
        get().reset();
      },
      reset: () => {
        const seed = buildSeedData();
        set({
          ...seed,
          products: [
            {
              id: nanoid(),
              name: "Thermal Paper Roll",
              sku: "TPR-001",
              price: 2.5,
              stock: 120,
              isArchived: false
            },
            {
              id: nanoid(),
              name: "Barcode Scanner",
              sku: "BSC-250",
              price: 180,
              stock: 12,
              isArchived: false
            },
            {
              id: nanoid(),
              name: "Receipt Printer",
              sku: "RPT-811",
              price: 320,
              stock: 6,
              isArchived: false
            }
          ],
          sales: [],
          purchases: [],
          sessions: [],
          auditLog: [],
          currentUserId: undefined,
          initialized: true
        });
      },
      login: (username, password) => {
        const state = get();
        const user = state.users.find(
          (candidate) =>
            candidate.username.toLowerCase() === username.toLowerCase()
        );
        if (!user || user.password !== password) {
          throw new Error("Invalid username or password.");
        }
        if (!user.active) {
          throw new Error("User account is disabled.");
        }

        const loginAt = formatISO(new Date());
        const session: UserSession = {
          id: nanoid(),
          userId: user.id,
          username: user.username,
          loginAt
        };

        set({
          currentUserId: user.id,
          sessions: [...state.sessions, session],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: loginAt,
              message: `${user.username} logged in.`,
              userId: user.id
            }
          ]
        });
      },
      logout: () => {
        const state = get();
        if (!state.currentUserId) {
          return;
        }

        const logoutAt = formatISO(new Date());
        const sessions = state.sessions.map((session) =>
          session.userId === state.currentUserId && !session.logoutAt
            ? { ...session, logoutAt }
            : session
        );
        const currentUser = selectUser(state);
        set({
          currentUserId: undefined,
          sessions,
          auditLog: [
            ...state.auditLog,
            ...(currentUser
              ? [
                  {
                    id: nanoid(),
                    occurredAt: logoutAt,
                    message: `${currentUser.username} logged out.`,
                    userId: currentUser.id
                  }
                ]
              : [])
          ]
        });
      },
      hasPermission: (permission) => {
        const state = get();
        const user = selectUser(state);
        if (!user) {
          return false;
        }

        const userRoles = state.userRoles
          .filter((relation) => relation.userId === user.id)
          .map((relation) =>
            state.roles.find((role) => role.id === relation.roleId)
          )
          .filter((role): role is Role => Boolean(role));

        const isSuperUser = userRoles.some(
          (role) => role.name === "Super User"
        );
        if (isSuperUser) {
          return true;
        }

        const permissionRecord = state.permissions.find(
          (item) => item.key === permission
        );
        if (!permissionRecord) {
          return false;
        }

        const rolePermissionIds = state.rolePermissions
          .filter((rp) =>
            userRoles.some((role) => role.id === rp.roleId)
          )
          .map((rp) => rp.permissionId);

        return rolePermissionIds.includes(permissionRecord.id);
      },
      assignRoleToUser: (userId, roleId) => {
        const state = get();
        ensurePermission(state, "manage_users");
        if (
          state.userRoles.some(
            (relation) =>
              relation.userId === userId && relation.roleId === roleId
          )
        ) {
          return;
        }
        set({
          userRoles: [...state.userRoles, { userId, roleId }],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Role assigned (roleId=${roleId}) to user ${userId}.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      revokeRoleFromUser: (userId, roleId) => {
        const state = get();
        ensurePermission(state, "manage_users");
        const role = state.roles.find((item) => item.id === roleId);
        if (role?.name === "Super User") {
          throw new Error("Super User role cannot be revoked.");
        }
        set({
          userRoles: state.userRoles.filter(
            (relation) =>
              !(relation.userId === userId && relation.roleId === roleId)
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Role revoked (roleId=${roleId}) from user ${userId}.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      createUser: (payload) => {
        const state = get();
        ensurePermission(state, "manage_users");
        if (
          state.users.some(
            (item) =>
              item.username.toLowerCase() ===
              payload.username.toLowerCase()
          )
        ) {
          throw new Error("Username already exists.");
        }
        const user: User = {
          id: nanoid(),
          isSystem: Boolean(payload.isSystem),
          ...payload
        };
        set({
          users: [...state.users, user],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `User ${user.username} created.`,
              userId: state.currentUserId
            }
          ]
        });
        return user;
      },
      updateUser: (userId, input) => {
        const state = get();
        ensurePermission(state, "manage_users");
        const user = state.users.find((item) => item.id === userId);
        if (!user) {
          throw new Error("User not found.");
        }
        const updatedUser = { ...user, ...input };
        set({
          users: state.users.map((item) =>
            item.id === userId ? updatedUser : item
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `User ${updatedUser.username} updated.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      deleteUser: (userId) => {
        const state = get();
        ensurePermission(state, "manage_users");
        const candidate = state.users.find((user) => user.id === userId);
        if (!candidate) {
          return;
        }
        if (candidate.isSystem) {
          throw new Error("System users cannot be deleted.");
        }
        const isSuperUser = state.userRoles.some((relation) => {
          if (relation.userId !== userId) {
            return false;
          }
          const role = state.roles.find((item) => item.id === relation.roleId);
          return role?.name === "Super User";
        });
        if (isSuperUser) {
          throw new Error("Super User accounts cannot be removed.");
        }
        set({
          users: state.users.filter((user) => user.id !== userId),
          userRoles: state.userRoles.filter(
            (relation) => relation.userId !== userId
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `User ${candidate.username} deleted.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      createRole: (payload) => {
        const state = get();
        ensurePermission(state, "manage_roles");
        if (
          state.roles.some(
            (role) => role.name.toLowerCase() === payload.name.toLowerCase()
          )
        ) {
          throw new Error("Role name already exists.");
        }
        const role: Role = { id: nanoid(), ...payload };
        set({
          roles: [...state.roles, role],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Role ${role.name} created.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      updateRole: (roleId, input) => {
        const state = get();
        ensurePermission(state, "manage_roles");
        const role = state.roles.find((item) => item.id === roleId);
        if (!role) {
          throw new Error("Role not found.");
        }
        if (role.isSystem) {
          throw new Error("System roles cannot be modified.");
        }
        set({
          roles: state.roles.map((item) =>
            item.id === roleId ? { ...item, ...input } : item
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Role ${role.name} updated.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      deleteRole: (roleId) => {
        const state = get();
        ensurePermission(state, "manage_roles");
        const role = state.roles.find((item) => item.id === roleId);
        if (!role) {
          return;
        }
        if (role.isSystem || role.name === "Super User") {
          throw new Error("Protected roles cannot be deleted.");
        }
        set({
          roles: state.roles.filter((item) => item.id !== roleId),
          rolePermissions: state.rolePermissions.filter(
            (relation) => relation.roleId !== roleId
          ),
          userRoles: state.userRoles.filter(
            (relation) => relation.roleId !== roleId
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Role ${role.name} deleted.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      setRolePermissions: (roleId, permissionKeys) => {
        const state = get();
        ensurePermission(state, "manage_permissions");
        const role = state.roles.find((item) => item.id === roleId);
        if (!role) {
          throw new Error("Role not found.");
        }
        if (role.name === "Super User") {
          throw new Error("Super User role already owns all permissions.");
        }
        if (role.isSystem && role.name === "Cashier") {
          // Enforce cashier restrictions.
          const prohibitedKeys: PermissionKey[] = [
            "manage_products",
            "delete_sale"
          ];
          if (permissionKeys.some((key) => prohibitedKeys.includes(key))) {
            throw new Error("Cashier role cannot receive elevated permissions.");
          }
        }
        const permissionIds = permissionKeys
          .map((key) =>
            state.permissions.find((permission) => permission.key === key)
          )
          .filter((value): value is Permission => Boolean(value))
          .map((permission) => permission.id);

        set({
          rolePermissions: [
            ...state.rolePermissions.filter(
              (relation) => relation.roleId !== roleId
            ),
            ...permissionIds.map((permissionId) => ({
              roleId,
              permissionId
            }))
          ],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Permissions updated for role ${role.name}.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      upsertProduct: (product) => {
        const state = get();
        ensurePermission(state, "manage_products");
        if (product.id) {
          set({
            products: state.products.map((existing) =>
              existing.id === product.id
                ? { ...existing, ...product }
                : existing
            ),
            auditLog: [
              ...state.auditLog,
              {
                id: nanoid(),
                occurredAt: formatISO(new Date()),
                message: `Product ${product.name} updated.`,
                userId: state.currentUserId
              }
            ]
          });
        } else {
          const newProduct: Product = {
            ...product,
            id: nanoid()
          };
          set({
            products: [...state.products, newProduct],
            auditLog: [
              ...state.auditLog,
              {
                id: nanoid(),
                occurredAt: formatISO(new Date()),
                message: `Product ${newProduct.name} created.`,
                userId: state.currentUserId
              }
            ]
          });
        }
      },
      archiveProduct: (productId) => {
        const state = get();
        ensurePermission(state, "manage_products");
        set({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, isArchived: true }
              : product
          ),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Product ${productId} archived.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      recordSale: ({ items, reference }) => {
        const state = get();
        ensurePermission(state, "record_sale");
        const user = selectUser(state);
        if (!user) {
          throw new Error("No active user.");
        }

        const now = formatISO(new Date());
        const payloadItems: SaleItem[] = items.map((item) => {
          const product = state.products.find(
            (candidate) => candidate.id === item.productId
          );
          return {
            ...item,
            productName: product?.name ?? "Unknown Product"
          };
        });
        const total = payloadItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );
        const sale: Sale = {
          id: nanoid(),
          reference: reference ?? `SAL-${Date.now()}`,
          items: payloadItems,
          total,
          createdAt: now,
          createdByUserId: user.id,
          createdByUsername: user.username
        };

        set({
          sales: [...state.sales, sale],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: now,
              message: `Sale ${sale.reference} recorded by ${user.username}.`,
              userId: user.id
            }
          ]
        });

        return sale;
      },
      deleteSale: (saleId) => {
        const state = get();
        ensurePermission(state, "delete_sale");
        const sale = state.sales.find((item) => item.id === saleId);
        if (!sale) {
          return;
        }
        set({
          sales: state.sales.filter((item) => item.id !== saleId),
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: formatISO(new Date()),
              message: `Sale ${sale.reference} deleted.`,
              userId: state.currentUserId
            }
          ]
        });
      },
      recordPurchase: ({ items, reference }) => {
        const state = get();
        ensurePermission(state, "record_purchase");
        const user = selectUser(state);
        if (!user) {
          throw new Error("No active user.");
        }

        const now = formatISO(new Date());
        const payloadItems: PurchaseItem[] = items.map((item) => {
          const product = state.products.find(
            (candidate) => candidate.id === item.productId
          );
          return {
            ...item,
            productName: product?.name ?? "Unknown Product"
          };
        });
        const total = payloadItems.reduce(
          (sum, item) => sum + item.quantity * item.unitCost,
          0
        );

        const purchase: Purchase = {
          id: nanoid(),
          reference: reference ?? `PUR-${Date.now()}`,
          items: payloadItems,
          total,
          createdAt: now,
          createdByUserId: user.id,
          createdByUsername: user.username
        };

        set({
          purchases: [...state.purchases, purchase],
          auditLog: [
            ...state.auditLog,
            {
              id: nanoid(),
              occurredAt: now,
              message: `Purchase ${purchase.reference} recorded by ${user.username}.`,
              userId: user.id
            }
          ]
        });

        return purchase;
      }
    }),
    {
      name: "expert-pos-store",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // Provide a no-op storage for server-side rendering paths.
          return {
            getItem: (_name: string) => null,
            setItem: (_name: string, _value: string) => {},
            removeItem: (_name: string) => {}
          };
        }
        return window.localStorage;
      })
    }
  )
);
