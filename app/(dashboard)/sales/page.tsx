'use client';

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import Button from "../../../components/ui/button";
import Card from "../../../components/ui/card";
import Input from "../../../components/ui/input";
import Label from "../../../components/ui/label";
import Badge from "../../../components/ui/badge";
import { useAppStore } from "../../../store/useAppStore";
import { useAuthorization, useCurrentUser } from "../../../lib/hooks";

interface DraftSaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const SalesPage = () => {
  const products = useAppStore((state) =>
    state.products.filter((product) => !product.isArchived)
  );
  const sales = useAppStore((state) => state.sales);
  const recordSale = useAppStore((state) => state.recordSale);
  const deleteSale = useAppStore((state) => state.deleteSale);
  const { can } = useAuthorization();
  const { user } = useCurrentUser();

  const [items, setItems] = useState<DraftSaleItem[]>([]);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | undefined>();

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [items]
  );

  const handleAddItem = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId,
          quantity: 1,
          unitPrice: product.price
        }
      ];
    });
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, value) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    if (items.length === 0) {
      setError("Add at least one product to complete the sale.");
      return;
    }
    try {
      recordSale({
        reference: reference.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      setItems([]);
      setReference("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">
            Sales Console
          </h2>
          <p className="text-sm text-slate-400">
            Capture POS tickets with automatic attribution to the active user.
          </p>
        </div>
        <Badge tone="neutral">
          Operator: {user?.username ?? "Unknown"}
        </Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Auto-generated if left empty"
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">
                Add products
              </p>
              <div className="grid gap-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        SKU {product.sku} · ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddItem(product.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Cart items</p>
              <div className="mt-2 space-y-3">
                {items.map((item) => {
                  const product = products.find(
                    (product) => product.id === item.productId
                  );
                  if (!product) {
                    return null;
                  }
                  return (
                    <div
                      key={item.productId}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(event) =>
                              handleQuantityChange(
                                item.productId,
                                Number(event.target.value)
                              )
                            }
                            className="w-20 text-center"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-right text-xs text-slate-500">
                        Line total ${(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Cart empty. Add products to proceed.
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={!can("record_sale")}>
              Record Sale · ${total.toFixed(2)}
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Recorded sales
              </h3>
              <p className="text-xs text-slate-500">
                Each sale stores the operator username and timestamp.
              </p>
            </div>
            <Badge tone="default">{sales.length} total</Badge>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">
                      {sale.reference}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(sale.createdAt), "PPpp")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-100">
                      ${sale.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sale.createdByUsername}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  {sale.items.map((item) => (
                    <li key={`${sale.id}-${item.productId}`}>
                      {item.quantity} x {item.productName} @ $
                      {item.unitPrice.toFixed(2)}
                    </li>
                  ))}
                </ul>
                {can("delete_sale") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-danger hover:text-danger"
                    onClick={() => deleteSale(sale.id)}
                  >
                    Void sale
                  </Button>
                )}
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-sm text-slate-500">
                No sales recorded yet. Every new sale captures the current user
                and timestamp for auditability.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
