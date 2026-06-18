import type { ClientMessage, Order, RoomState, ServerMessage } from "../src/lib/types";

interface Env {
  ROOM: DurableObjectNamespace;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Protocol",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    // partysocket connects to /parties/:name/:room (default name = "main")
    const match = url.pathname.match(/^\/parties\/[^/]+\/([^/]+)$/) ??
                  url.pathname.match(/^\/party\/([^/]+)$/);
    if (!match) {
      return new Response("Service Jay WS", { status: 200, headers: CORS_HEADERS });
    }

    const roomId = match[1];
    const stub = env.ROOM.get(env.ROOM.idFromName(roomId));
    return stub.fetch(request);
  },
} satisfies ExportedHandler<Env>;

export class Room implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const url = new URL(request.url);
    const roomId = url.pathname.match(/\/parties\/[^/]+\/([^/]+)/)?.[1] ??
                   url.pathname.match(/\/party\/([^/]+)/)?.[1] ?? "unknown";

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

    const connId = crypto.randomUUID();
    this.state.acceptWebSocket(server, [connId]);

    const state = await this.getState(roomId);
    server.send(JSON.stringify({ type: "room:state", state } satisfies ServerMessage));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== "string") return;

    const [connId] = this.state.getTags(ws);

    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      ws.send(JSON.stringify({ type: "error", code: "INVALID_JSON", message: "Invalid message" } satisfies ServerMessage));
      return;
    }

    const state = await this.getState();

    if (state.closedAt) {
      ws.send(JSON.stringify({ type: "error", code: "ROOM_CLOSED", message: "Room is closed" } satisfies ServerMessage));
      return;
    }

    switch (msg.type) {
      case "host:claim": {
        state.hostConnectionId = connId;
        await this.saveState(state);
        break;
      }

      case "guest:join": {
        break;
      }

      case "order:place": {
        const order: Order = {
          ...msg.order,
          id: crypto.randomUUID().replace(/-/g, "").slice(0, 10),
          status: "pending",
          placedAt: Date.now(),
        };
        state.orders[order.id] = order;
        await this.saveState(state);
        this.broadcast({ type: "order:new", order });
        break;
      }

      case "order:fulfill": {
        if (connId !== state.hostConnectionId) {
          ws.send(JSON.stringify({ type: "error", code: "UNAUTHORIZED", message: "Only the host can fulfill orders" } satisfies ServerMessage));
          return;
        }
        const fulfillOrder = state.orders[msg.orderId];
        if (!fulfillOrder) {
          ws.send(JSON.stringify({ type: "error", code: "NOT_FOUND", message: "Order not found" } satisfies ServerMessage));
          return;
        }
        fulfillOrder.status = "fulfilled";
        fulfillOrder.fulfilledAt = Date.now();
        await this.saveState(state);
        this.broadcast({ type: "order:updated", order: fulfillOrder });
        break;
      }

      case "order:unavailable": {
        if (connId !== state.hostConnectionId) {
          ws.send(JSON.stringify({ type: "error", code: "UNAUTHORIZED", message: "Only the host can update orders" } satisfies ServerMessage));
          return;
        }
        const unavailOrder = state.orders[msg.orderId];
        if (!unavailOrder) {
          ws.send(JSON.stringify({ type: "error", code: "NOT_FOUND", message: "Order not found" } satisfies ServerMessage));
          return;
        }
        unavailOrder.status = "unavailable";
        unavailOrder.fulfilledAt = Date.now();
        await this.saveState(state);
        this.broadcast({ type: "order:updated", order: unavailOrder });
        break;
      }

      case "room:close": {
        if (connId !== state.hostConnectionId) {
          ws.send(JSON.stringify({ type: "error", code: "UNAUTHORIZED", message: "Only the host can close the room" } satisfies ServerMessage));
          return;
        }
        state.closedAt = Date.now();
        await this.saveState(state);
        this.broadcast({ type: "room:closed" });
        break;
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const [connId] = this.state.getTags(ws);
    const state = await this.getState();
    if (state.hostConnectionId === connId) {
      state.hostConnectionId = null;
      await this.saveState(state);
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws);
  }

  private async getState(roomId?: string): Promise<RoomState> {
    const stored = await this.state.storage.get<RoomState>("state");
    if (stored) return stored;
    const initial: RoomState = {
      roomId: roomId ?? "unknown",
      hostConnectionId: null,
      orders: {},
      createdAt: Date.now(),
    };
    await this.state.storage.put("state", initial);
    return initial;
  }

  private async saveState(state: RoomState): Promise<void> {
    await this.state.storage.put("state", state);
  }

  private broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(data);
      } catch {
        // already closed
      }
    }
  }
}
