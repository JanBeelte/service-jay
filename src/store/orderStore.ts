import { create } from "zustand";
import type { Order, RoomState } from "../lib/types";

interface OrderStore {
  orders: Record<string, Order>;
  myGuestId: string | null;
  newlyFulfilledIds: string[];
  setOrders: (orders: Record<string, Order>) => void;
  upsertOrder: (order: Order) => void;
  setMyGuestId: (id: string) => void;
  dismissFulfilled: (orderId: string) => void;
  applyRoomState: (state: RoomState) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: {},
  myGuestId: null,
  newlyFulfilledIds: [],

  setOrders: (orders) => set({ orders }),

  upsertOrder: (order) => {
    const prev = get().orders[order.id];
    const myGuestId = get().myGuestId;
    set((s) => ({ orders: { ...s.orders, [order.id]: order } }));
    // Notify guest when their order is resolved (fulfilled or unavailable)
    if (
      myGuestId &&
      order.guestId === myGuestId &&
      (order.status === "fulfilled" || order.status === "unavailable") &&
      prev?.status === "pending"
    ) {
      set((s) => ({ newlyFulfilledIds: [...s.newlyFulfilledIds, order.id] }));
    }
  },

  setMyGuestId: (id) => set({ myGuestId: id }),

  dismissFulfilled: (orderId) =>
    set((s) => ({ newlyFulfilledIds: s.newlyFulfilledIds.filter((id) => id !== orderId) })),

  applyRoomState: (state) => {
    const myGuestId = get().myGuestId;
    // Find orders newly fulfilled since we last saw them (reconnect case)
    if (myGuestId) {
      const prevOrders = get().orders;
      const newlyFulfilled: string[] = [];
      for (const order of Object.values(state.orders)) {
        if (
          order.guestId === myGuestId &&
          (order.status === "fulfilled" || order.status === "unavailable") &&
          prevOrders[order.id]?.status === "pending"
        ) {
          newlyFulfilled.push(order.id);
        }
      }
      if (newlyFulfilled.length > 0) {
        set((s) => ({ newlyFulfilledIds: [...s.newlyFulfilledIds, ...newlyFulfilled] }));
      }
    }
    set({ orders: state.orders });
  },

  reset: () => set({ orders: {}, myGuestId: null, newlyFulfilledIds: [] }),
}));
