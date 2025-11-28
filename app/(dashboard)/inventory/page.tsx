'use client';

import { FormEvent, useState } from "react";
import Card from "../../../components/ui/card";
import Label from "../../../components/ui/label";
import Input from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import Badge from "../../../components/ui/badge";
import { useAppStore } from "../../../store/useAppStore";
import { useAuthorization } from "../../../lib/hooks";

const InventoryPage = () => {
  const products = useAppStore((state) => state.products);
  const upsertProduct = useAppStore((state) => state.upsertProduct);
  const archiveProduct = useAppStore((state) => state.archiveProduct);
  const { can } = useAuthorization();

  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const canManage = can("manage_products");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) {
      setError("Current role cannot modify products.");
      return;
    }
    try {
      upsertProduct({
        name: formState.name.trim(),
        sku: formState.sku.trim(),
        price: Number(formState.price),
        stock: Number(formState.stock),
        isArchived: false
      });
      setFormState({
        name: "",
        sku: "",
        price: 0,
        stock: 0
      });
      setSuccess("Product saved successfully.");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          Inventory Control
        </h2>
        <p className="text-sm text-slate-400">
          Maintain product catalog with cashier-safe restrictions.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr,2fr]">
        <Card>
          <h3 className="text-lg font-semibold text-slate-100">
            {canManage ? "Create product" : "View-only mode"}
          </h3>
          <p className="text-xs text-slate-500">
            Cashiers are automatically restricted from editing products.
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
                disabled={!canManage}
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formState.sku}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    sku: event.target.value
                  }))
                }
                disabled={!canManage}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      price: Number(event.target.value)
                    }))
                  }
                  disabled={!canManage}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  value={formState.stock}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      stock: Number(event.target.value)
                    }))
                  }
                  disabled={!canManage}
                />
              </div>
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
            <Button type="submit" disabled={!canManage}>
              Save product
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Catalog overview
              </h3>
              <p className="text-xs text-slate-500">
                Archived items are hidden from sales entries.
              </p>
            </div>
            <Badge tone="neutral">
              {products.filter((item) => !item.isArchived).length} active
            </Badge>
          </div>
          <div className="mt-4 space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      SKU {product.sku} · ${product.price.toFixed(2)} ·{" "}
                      {product.stock} in stock
                    </p>
                  </div>
                  <Badge tone={product.isArchived ? "danger" : "success"}>
                    {product.isArchived ? "Archived" : "Active"}
                  </Badge>
                </div>
                {canManage && !product.isArchived && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-danger hover:text-danger"
                    onClick={() => archiveProduct(product.id)}
                  >
                    Archive product
                  </Button>
                )}
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-slate-500">
                Catalog empty. Create products to make them available for sales.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InventoryPage;
