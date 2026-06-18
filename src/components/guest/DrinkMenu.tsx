import defaultMenuData from "../../data/menu.json";
import type { Menu } from "../../lib/types";
import { DrinkCard } from "./DrinkCard";

interface Props {
  menu?: Menu | null;
  onOrder: (drinkId: string, drinkName: string, quantity: number, note?: string, selectedOptions?: string[]) => void;
}

export function DrinkMenu({ menu: menuProp, onOrder }: Props) {
  const menu = menuProp ?? (defaultMenuData as Menu);
  return (
    <div className="flex flex-col gap-6">
      {menu.categories.map((category) => {
        const available = category.items.filter((i) => i.available);
        if (available.length === 0) return null;
        return (
          <section key={category.id}>
            <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-3 px-1">
              {category.label}
            </h2>
            <div className="flex flex-col gap-2">
              {available.map((item) => (
                <DrinkCard key={item.id} item={item} onOrder={onOrder} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
