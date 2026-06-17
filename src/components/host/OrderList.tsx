import { useOrderStore } from "../../store/orderStore";
import { OrderCard } from "./OrderCard";

interface Props {
  onFulfill: (id: string) => void;
  onUnavailable: (id: string) => void;
}

export function OrderList({ onFulfill, onUnavailable }: Props) {
  const orders = useOrderStore((s) => s.orders);
  const pending = Object.values(orders)
    .filter((o) => o.status === "pending")
    .sort((a, b) => a.placedAt - b.placedAt);

  if (pending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <span className="text-4xl mb-3">🍹</span>
        <p className="text-sm">Waiting for orders…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 mt-2 px-1">
        Open orders ({pending.length})
      </p>
      {pending.map((o) => (
        <OrderCard key={o.id} order={o} onFulfill={onFulfill} onUnavailable={onUnavailable} />
      ))}
    </div>
  );
}
