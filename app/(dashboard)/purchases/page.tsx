'use client';

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import Card from "../../../components/ui/card";
import Label from "../../../components/ui/label";
import Input from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import Badge from "../../../components/ui/badge";
import { useAppStore } from "../../../store/useAppStore";
import { useAuthorization } from "../../../lib/hooks";

interface DraftPurchaseItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

const PurchasesPage = () => {
  const products = useAppStore((state) =>
    state.products.filter((product) => !product.isArchived)
  );
  const purchases = useAppStore((state) => state.purchases);
  const recordPurchase = useAppStore((state) => state.recordPurchase);
  const { can } = useAuthorization();

  const [reference, setReference] = useState("");
  const [items, setItems] = useState<DraftPurchaseItem[]>([]);
  const [error, setError] = useState<string | undefined>();

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0
      ),
    [items]
  );

  const handleAddProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId,
        quantity: 1,
        unitCost: product.price
      }
    ]);
  };

  const handleChangeItem = (
    index: number,
    key: keyof DraftPurchaseItem,
    value: number
  ) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: key === "quantity" ? Math.max(1, value) : Math.max(0, value)
            }
          : item
      )
    );
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    if (items.length === 0) {
      setError("Add at least one line to record a purchase.");
      return;
    }
    try {
      recordPurchase({
        reference: reference.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
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
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          Purchase Logging
        </h2>
        <p className="text-sm text-slate-400">
          Maintain replenishment history with accountable user context.
        </p>
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
                placeholder="Optional document reference"
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">
                Select product
              </p>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddProduct(product.id)}
                  >
                    {product.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-200">Items</p>
              <div className="space-y-3">
                {items.map((item, index) => {
                  const product = products.find(
                    (product) => product.id === item.productId
                  );
                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {product?.name ?? "Unknown product"}
                          </p>
                          <p className="text-xs text-slate-500">
                            SKU {product?.sku ?? "N/A"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(event) =>
                              handleChangeItem(
                                index,
                                "quantity",
                                Number(event.target.value)
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Unit cost</Label>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitCost}
                            onChange={(event) =>
                              handleChangeItem(
                                index,
                                "unitCost",
                                Number(event.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-right text-xs text-slate-500">
                        Line total ${(item.quantity * item.unitCost).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No items yet. Select stock items to log a purchase.
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={!can("record_purchase")}>
              Record Purchase · ${total.toFixed(2)}
            </Button>
          </form>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                Purchase history
              </h3>
              <p className="text-xs text-slate-500">
                Audit-friendly ledger with user & timestamp.
              </p>
            </div>
            <Badge tone="neutral">{purchases.length} records</Badge>
          </div>
          <div className="mt-4 space-y-4 text-sm">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">
                      {purchase.reference}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(purchase.createdAt), "PPpp")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-100">
                      ${purchase.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {purchase.createdByUsername}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  {purchase.items.map((item, index) => (
                    <li key={`${purchase.id}-${index}`}>
                      {item.quantity} x {item.productName} @ $
                      {item.unitCost.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {purchases.length === 0 && (
              <p className="text-sm text-slate-500">
                No purchases recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PurchasesPage;
