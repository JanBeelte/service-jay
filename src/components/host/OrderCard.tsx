import { CheckCircle2, Clock, Ban } from "lucide-react";
import type { Order } from "../../lib/types";

interface Props {
  order: Order;
  onFulfill: (id: string) => void;
  onUnavailable: (id: string) => void;
}

export function OrderCard({ order, onFulfill, onUnavailable }: Props) {
  const time = new Date(order.placedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-slate-800 border-slate-700">
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-white truncate block">
          {order.quantity}× {order.drinkName}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-slate-400 text-sm truncate">{order.guestName}</span>
          <span className="text-slate-600 text-sm">·</span>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 text-xs">{time}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onUnavailable(order.id)}
          title="Mark as unavailable"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-sm font-medium transition-colors active:scale-95"
        >
          <Ban className="w-4 h-4" />
          N/A
        </button>
        <button
          onClick={() => onFulfill(order.id)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          Done
        </button>
      </div>
    </div>
  );
}
