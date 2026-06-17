import { CheckCircle2, Loader2, Ban } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";

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
          <div key={o.id} className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span className="text-white text-sm flex-1">{o.quantity}× {o.drinkName}</span>
            <span className="text-slate-500 text-xs">pending</span>
          </div>
        ))}
        {resolved.map((o) => (
          <div key={o.id} className="flex items-center gap-3 opacity-60">
            {o.status === "unavailable" ? (
              <Ban className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            )}
            <span className="text-slate-300 text-sm flex-1">{o.quantity}× {o.drinkName}</span>
            <span className="text-slate-500 text-xs">
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
