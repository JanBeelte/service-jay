import { useEffect } from "react";
import { usePartyRoom } from "./usePartyRoom";
import { useRoomStore } from "../store/roomStore";

export function useHostRoom(roomId: string) {
  const { send } = usePartyRoom(roomId);
  const { setRoom, connectionStatus } = useRoomStore();

  useEffect(() => {
    setRoom(roomId, "host");
  }, [roomId]);

  useEffect(() => {
    if (connectionStatus === "connected") {
      send({ type: "host:claim" });
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

  return { fulfillOrder, markUnavailable, closeRoom };
}
