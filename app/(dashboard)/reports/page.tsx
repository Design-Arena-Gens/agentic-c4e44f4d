'use client';

import { format } from "date-fns";
import Card from "../../../components/ui/card";
import Badge from "../../../components/ui/badge";
import { useAppStore } from "../../../store/useAppStore";

const ReportsPage = () => {
  const sales = useAppStore((state) => state.sales);
  const purchases = useAppStore((state) => state.purchases);

  const salesTotal = sales.reduce((sum, sale) => sum + sale.total, 0);
  const purchaseTotal = purchases.reduce(
    (sum, purchase) => sum + purchase.total,
    0
  );
  const profit = salesTotal - purchaseTotal;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          Executive Reports
        </h2>
        <p className="text-sm text-slate-400">
          Consolidated KPIs derived from sales and purchase transactions.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Sales revenue
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            ${salesTotal.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {sales.length} sales recorded
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Purchase spend
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            ${purchaseTotal.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {purchases.length} purchases logged
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Gross profit
          </p>
          <p className="mt-4 text-3xl font-semibold text-slate-100">
            ${profit.toFixed(2)}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Sales minus purchases
          </p>
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-slate-100">
          Sales drill-down
        </h3>
        <div className="mt-4 space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
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
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {sale.items.map((item) => (
                  <li key={`${sale.id}-${item.productId}`}>
                    {item.quantity} × {item.productName} @ $
                    {item.unitPrice.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {sales.length === 0 && (
            <p className="text-sm text-slate-500">
              No sales recorded yet.
            </p>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-100">
          Purchase drill-down
        </h3>
        <div className="mt-4 space-y-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm"
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
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {purchase.items.map((item, index) => (
                  <li key={`${purchase.id}-${index}`}>
                    {item.quantity} × {item.productName} @ $
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
  );
};

export default ReportsPage;
