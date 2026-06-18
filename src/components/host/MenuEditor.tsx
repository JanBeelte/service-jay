import { useState } from "react";
import type { Menu, MenuCategory, MenuItem, MenuItemOption } from "../../lib/types";
import defaultMenuData from "../../data/menu.json";
import { X, Plus, Trash2 } from "lucide-react";

interface Props {
  currentMenu: Menu | null;
  onSave: (menu: Menu) => void;
  onClose: () => void;
}

function newItem(): MenuItem {
  return { id: crypto.randomUUID(), name: "", description: "", emoji: "🍹", available: true, freeText: true };
}

function newCategory(): MenuCategory {
  return { id: crypto.randomUUID(), label: "", items: [] };
}

export function MenuEditor({ currentMenu, onSave, onClose }: Props) {
  const [menu, setMenu] = useState<Menu>(() =>
    JSON.parse(JSON.stringify(currentMenu ?? defaultMenuData))
  );
  const [optionInputs, setOptionInputs] = useState<Record<string, string>>({});

  function updateCategory(catIdx: number, patch: Partial<MenuCategory>) {
    setMenu((m) => {
      const cats = [...m.categories];
      cats[catIdx] = { ...cats[catIdx], ...patch };
      return { ...m, categories: cats };
    });
  }

  function deleteCategory(catIdx: number) {
    setMenu((m) => ({ ...m, categories: m.categories.filter((_, i) => i !== catIdx) }));
  }

  function updateItem(catIdx: number, itemIdx: number, patch: Partial<MenuItem>) {
    setMenu((m) => {
      const cats = [...m.categories];
      const items = [...cats[catIdx].items];
      items[itemIdx] = { ...items[itemIdx], ...patch };
      cats[catIdx] = { ...cats[catIdx], items };
      return { ...m, categories: cats };
    });
  }

  function deleteItem(catIdx: number, itemIdx: number) {
    setMenu((m) => {
      const cats = [...m.categories];
      cats[catIdx] = { ...cats[catIdx], items: cats[catIdx].items.filter((_, i) => i !== itemIdx) };
      return { ...m, categories: cats };
    });
  }

  function addItem(catIdx: number) {
    setMenu((m) => {
      const cats = [...m.categories];
      cats[catIdx] = { ...cats[catIdx], items: [...cats[catIdx].items, newItem()] };
      return { ...m, categories: cats };
    });
  }

  function addOption(catIdx: number, itemIdx: number, label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const option: MenuItemOption = { id: crypto.randomUUID(), label: trimmed, type: "checkbox" };
    setMenu((m) => {
      const cats = [...m.categories];
      const items = [...cats[catIdx].items];
      items[itemIdx] = { ...items[itemIdx], options: [...(items[itemIdx].options ?? []), option] };
      cats[catIdx] = { ...cats[catIdx], items };
      return { ...m, categories: cats };
    });
  }

  function removeOption(catIdx: number, itemIdx: number, optionIdx: number) {
    setMenu((m) => {
      const cats = [...m.categories];
      const items = [...cats[catIdx].items];
      items[itemIdx] = {
        ...items[itemIdx],
        options: (items[itemIdx].options ?? []).filter((_, i) => i !== optionIdx),
      };
      cats[catIdx] = { ...cats[catIdx], items };
      return { ...m, categories: cats };
    });
  }

  function addCategory() {
    setMenu((m) => ({ ...m, categories: [...m.categories, newCategory()] }));
  }

  function handleSave() {
    onSave({ ...menu, version: (menu.version ?? 1) + 1 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">Edit Menu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {menu.categories.map((cat, catIdx) => (
            <div key={cat.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  value={cat.label}
                  onChange={(e) => updateCategory(catIdx, { label: e.target.value })}
                  placeholder="Category name"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => deleteCategory(catIdx)}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2 pl-3 border-l border-slate-800">
                {cat.items.map((item, itemIdx) => {
                  const optKey = `${catIdx}-${itemIdx}`;
                  return (
                    <div key={item.id} className="bg-slate-800/50 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          value={item.emoji}
                          onChange={(e) => updateItem(catIdx, itemIdx, { emoji: e.target.value })}
                          className="w-10 bg-slate-800 border border-slate-700 rounded-lg px-1 py-1.5 text-center text-sm focus:outline-none focus:border-amber-400"
                          maxLength={2}
                        />
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(catIdx, itemIdx, { name: e.target.value })}
                          placeholder="Item name"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={() => updateItem(catIdx, itemIdx, { available: !item.available })}
                          className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            item.available
                              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-slate-700 text-slate-500 hover:bg-slate-600"
                          }`}
                          title={item.available ? "Available" : "Unavailable"}
                        >
                          {item.available ? "On" : "Off"}
                        </button>
                        <button
                          onClick={() => deleteItem(catIdx, itemIdx)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1 shrink-0"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        value={item.description}
                        onChange={(e) => updateItem(catIdx, itemIdx, { description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />

                      {/* Options */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(item.options ?? []).map((opt, optIdx) => (
                          <span
                            key={opt.id}
                            className="flex items-center gap-1 bg-slate-700 text-slate-300 text-xs rounded-full px-2.5 py-1"
                          >
                            {opt.label}
                            <button
                              onClick={() => removeOption(catIdx, itemIdx, optIdx)}
                              className="text-slate-500 hover:text-red-400 transition-colors ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            addOption(catIdx, itemIdx, optionInputs[optKey] ?? "");
                            setOptionInputs((o) => ({ ...o, [optKey]: "" }));
                          }}
                          className="flex items-center gap-1"
                        >
                          <input
                            value={optionInputs[optKey] ?? ""}
                            onChange={(e) => setOptionInputs((o) => ({ ...o, [optKey]: e.target.value }))}
                            placeholder="+ option"
                            className="w-24 bg-transparent border border-dashed border-slate-600 hover:border-slate-500 focus:border-amber-400 rounded-full px-2.5 py-1 text-xs text-slate-400 placeholder-slate-600 focus:outline-none focus:text-white transition-colors"
                          />
                        </form>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => addItem(catIdx)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-amber-400 transition-colors text-sm py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add item
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addCategory}
            className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm border border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl px-4 py-3 justify-center"
          >
            <Plus className="w-4 h-4" />
            Add category
          </button>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-900 text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
