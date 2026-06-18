import { useEffect } from "react";
import { usePartyRoom } from "./usePartyRoom";
import { useRoomStore } from "../store/roomStore";
import { useOrderStore } from "../store/orderStore";
import { generateGuestId } from "../lib/roomId";
import type { Order } from "../lib/types";

function getOrCreateGuestId(): string {
  let id = sessionStorage.getItem("guestId");
  if (!id) {
    id = generateGuestId();
    sessionStorage.setItem("guestId", id);
  }
  return id;
}

export function useGuestRoom(roomId: string, guestName: string) {
  const { send } = usePartyRoom(roomId);
  const { setRoom, connectionStatus } = useRoomStore();
  const { setMyGuestId } = useOrderStore();

  const guestId = getOrCreateGuestId();

  useEffect(() => {
    setRoom(roomId, "guest");
    setMyGuestId(guestId);
  }, [roomId, guestId]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      send({ type: "guest:join", guestId, guestName });
    }
  }, [connectionStatus]);

  function placeOrder(drinkId: string, drinkName: string, quantity: number, note?: string, selectedOptions?: string[]) {
    const order: Omit<Order, "id" | "status" | "fulfilledAt"> = {
      guestId,
      guestName,
      drinkId,
      drinkName,
      quantity,
      ...(note ? { note } : {}),
      ...(selectedOptions?.length ? { selectedOptions } : {}),
      placedAt: Date.now(),
    };
    send({ type: "order:place", order });
  }

  return { guestId, placeOrder };
}
