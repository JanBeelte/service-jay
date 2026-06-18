import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { MenuItem } from "../../lib/types";

interface Props {
  item: MenuItem;
  onOrder: (drinkId: string, drinkName: string, quantity: number, note?: string, selectedOptions?: string[]) => void;
}

export function DrinkCard({ item, onOrder }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [checkedOptions, setCheckedOptions] = useState<Set<string>>(new Set());

  if (!item.available) return null;

  function toggleOption(id: string) {
    setCheckedOptions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleOrder() {
    const selectedOptions = checkedOptions.size > 0 ? [...checkedOptions] : undefined;
    onOrder(item.id, item.name, quantity, note || undefined, selectedOptions);
    setQuantity(1);
    setNote("");
    setCheckedOptions(new Set());
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{item.name}</p>
          {item.description && (
            <p className="text-slate-400 text-sm">{item.description}</p>
          )}
        </div>
        {item.options && item.options.length > 0 && (
          <div className="flex flex-col gap-2 shrink-0">
            {item.options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkedOptions.has(opt.id)}
                  onChange={() => toggleOption(opt.id)}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
                <span className="text-slate-300 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {item.freeText && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note… (optional)"
          maxLength={100}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      )}

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
          onClick={handleOrder}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          Order
        </button>
      </div>
    </div>
  );
}
