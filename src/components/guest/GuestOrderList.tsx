import { CheckCircle2, Loader2, Ban } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import menuData from "../../data/menu.json";
import type { Menu } from "../../lib/types";

const allOptions = (menuData as Menu).categories
  .flatMap((c) => c.items)
  .flatMap((i) => i.options ?? [])
  .reduce<Record<string, string>>((acc, o) => { acc[o.id] = o.label; return acc; }, {});

export function GuestOrderList() {
  const { orders, myGuestId } = useOrderStore();

  const myOrders = Object.values(orders)
    .filter((o) => o.guestId === myGuestId)
    .sort((a, b) => b.placedAt - a.placedAt);

  if (myOrders.length === 0) return null;

  const pending = myOrders.filter((o) => o.status === "pending");
  const resolved = myOrders.filter((o) => o.status !== "pending");

  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Your Orders</p>
      <div className="flex flex-col gap-2">
        {pending.map((o) => (
          <div key={o.id} className="flex items-start gap-3">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-white text-sm">{o.quantity}× {o.drinkName}</span>
              {o.selectedOptions && o.selectedOptions.length > 0 && (
                <p className="text-amber-300 text-xs mt-0.5">{o.selectedOptions.map((id) => allOptions[id] ?? id).join(", ")}</p>
              )}
              {o.note && <p className="text-slate-400 text-xs mt-0.5">"{o.note}"</p>}
            </div>
            <span className="text-slate-500 text-xs shrink-0">pending</span>
          </div>
        ))}
        {resolved.map((o) => (
          <div key={o.id} className="flex items-start gap-3 opacity-60">
            {o.status === "unavailable" ? (
              <Ban className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-slate-300 text-sm">{o.quantity}× {o.drinkName}</span>
              {o.selectedOptions && o.selectedOptions.length > 0 && (
                <p className="text-amber-300 text-xs mt-0.5">{o.selectedOptions.map((id) => allOptions[id] ?? id).join(", ")}</p>
              )}
              {o.note && <p className="text-slate-400 text-xs mt-0.5">"{o.note}"</p>}
            </div>
            <span className="text-slate-500 text-xs shrink-0">
              {o.status === "unavailable" ? "unavailable" : "done"}
            </span>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <p className="text-slate-500 text-xs mt-3 text-center">
          Keep this page open to receive your notification
        </p>
      )}
    </div>
  );
}
