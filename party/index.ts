import type * as Party from "partykit/server";
import type { ClientMessage, Order, RoomState, ServerMessage } from "../src/lib/types";

function nanoid(len: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789";
  let id = "";
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  for (const byte of array) {
    id += alphabet[byte % alphabet.length];
  }
  return id;
}

function send(conn: Party.Connection, msg: ServerMessage) {
  conn.send(JSON.stringify(msg));
}

function broadcast(room: Party.Room, msg: ServerMessage) {
  room.broadcast(JSON.stringify(msg));
}

export default class ServiceJayServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async getState(): Promise<RoomState> {
    const stored = await this.room.storage.get<RoomState>("state");
    if (stored) return stored;
    const initial: RoomState = {
      roomId: this.room.id,
      hostConnectionId: null,
      orders: {},
      createdAt: Date.now(),
    };
    await this.room.storage.put("state", initial);
    return initial;
  }

  async saveState(state: RoomState) {
    await this.room.storage.put("state", state);
  }

  async onConnect(conn: Party.Connection) {
    const state = await this.getState();
    send(conn, { type: "room:state", state });
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      send(sender, { type: "error", code: "INVALID_JSON", message: "Invalid message format" });
      return;
    }

    const state = await this.getState();

    if (state.closedAt) {
      send(sender, { type: "error", code: "ROOM_CLOSED", message: "Room is closed" });
      return;
    }

    switch (msg.type) {
      case "host:claim": {
        state.hostConnectionId = sender.id;
        await this.saveState(state);
        break;
      }

      case "guest:join": {
        // stateless — no state mutation, just acknowledged via room:state already sent on connect
        break;
      }

      case "order:place": {
        const order: Order = {
          ...msg.order,
          id: nanoid(10),
          status: "pending",
          placedAt: Date.now(),
        };
        state.orders[order.id] = order;
        await this.saveState(state);
        broadcast(this.room, { type: "order:new", order });
        break;
      }

      case "order:fulfill": {
        if (sender.id !== state.hostConnectionId) {
          send(sender, { type: "error", code: "UNAUTHORIZED", message: "Only the host can fulfill orders" });
          return;
        }
        const order = state.orders[msg.orderId];
        if (!order) {
          send(sender, { type: "error", code: "NOT_FOUND", message: "Order not found" });
          return;
        }
        order.status = "fulfilled";
        order.fulfilledAt = Date.now();
        await this.saveState(state);
        broadcast(this.room, { type: "order:updated", order });
        break;
      }

      case "order:unavailable": {
        if (sender.id !== state.hostConnectionId) {
          send(sender, { type: "error", code: "UNAUTHORIZED", message: "Only the host can update orders" });
          return;
        }
        const order = state.orders[msg.orderId];
        if (!order) {
          send(sender, { type: "error", code: "NOT_FOUND", message: "Order not found" });
          return;
        }
        order.status = "unavailable";
        order.fulfilledAt = Date.now();
        await this.saveState(state);
        broadcast(this.room, { type: "order:updated", order });
        break;
      }

      case "room:close": {
        if (sender.id !== state.hostConnectionId) {
          send(sender, { type: "error", code: "UNAUTHORIZED", message: "Only the host can close the room" });
          return;
        }
        state.closedAt = Date.now();
        await this.saveState(state);
        broadcast(this.room, { type: "room:closed" });
        break;
      }
    }
  }

  async onClose(conn: Party.Connection) {
    const state = await this.getState();
    if (state.hostConnectionId === conn.id) {
      state.hostConnectionId = null;
      await this.saveState(state);
    }
  }
}

export const onFetch: Party.Worker["fetch"] = async (_req, _lobby, _ctx) => {
  return new Response("Service Jay Party Server", { status: 200 });
};
