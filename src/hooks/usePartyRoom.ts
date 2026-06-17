import { useEffect, useRef } from "react";
import PartySocket from "partysocket";
import type { ServerMessage } from "../lib/types";
import { partySocketOptions } from "../lib/partykit";
import { useRoomStore } from "../store/roomStore";
import { useOrderStore } from "../store/orderStore";

export function usePartyRoom(roomId: string) {
  const socketRef = useRef<PartySocket | null>(null);
  const { setConnectionStatus, setRoomClosed } = useRoomStore();
  const { applyRoomState, upsertOrder } = useOrderStore();

  useEffect(() => {
    const socket = new PartySocket(partySocketOptions(roomId));
    socketRef.current = socket;
    setConnectionStatus("connecting");

    socket.addEventListener("open", () => {
      setConnectionStatus("connected");
    });

    socket.addEventListener("close", () => {
      setConnectionStatus("disconnected");
    });

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(event.data) as ServerMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case "room:state":
          applyRoomState(msg.state);
          break;
        case "order:new":
        case "order:updated":
          upsertOrder(msg.order);
          break;
        case "room:closed":
          setRoomClosed();
          break;
        case "error":
          console.error("[PartyKit error]", msg.code, msg.message);
          break;
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
    };
  }, [roomId]);

  function send(msg: object) {
    socketRef.current?.send(JSON.stringify(msg));
  }

  return { send };
}
