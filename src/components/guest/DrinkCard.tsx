import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { MenuItem } from "../../lib/types";

interface Props {
  item: MenuItem;
  onOrder: (drinkId: string, drinkName: string, quantity: number) => void;
}

export function DrinkCard({ item, onOrder }: Props) {
  const [quantity, setQuantity] = useState(1);

  if (!item.available) return null;

  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{item.name}</p>
          <p className="text-slate-400 text-sm">{item.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-5 text-center text-white font-medium text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(5, q + 1))}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            onOrder(item.id, item.name, quantity);
            setQuantity(1);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          Order
        </button>
      </div>
    </div>
  );
}
