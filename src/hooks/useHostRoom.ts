import { useEffect } from "react";
import { usePartyRoom } from "./usePartyRoom";
import { useRoomStore } from "../store/roomStore";
import { useOrderStore } from "../store/orderStore";
import type { Menu } from "../lib/types";

export function useHostRoom(roomId: string, roomName: string) {
  const { send } = usePartyRoom(roomId);
  const { setRoom, connectionStatus } = useRoomStore();
  const resetOrders = useOrderStore((s) => s.reset);

  useEffect(() => {
    setRoom(roomId, "host");
    resetOrders();
  }, [roomId]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      send({ type: "host:claim", roomName });
    }
  }, [connectionStatus]);

  function fulfillOrder(orderId: string) {
    send({ type: "order:fulfill", orderId });
  }

  function markUnavailable(orderId: string) {
    send({ type: "order:unavailable", orderId });
  }

  function closeRoom() {
    send({ type: "room:close" });
  }

  function updateMenu(menu: Menu) {
    send({ type: "menu:update", menu });
    localStorage.setItem(`menu:${roomId}`, JSON.stringify(menu));
  }

  return { fulfillOrder, markUnavailable, closeRoom, updateMenu };
}
