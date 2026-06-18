export type OrderStatus = "pending" | "fulfilled" | "unavailable";

export interface Order {
  id: string;
  guestId: string;
  guestName: string;
  drinkId: string;
  drinkName: string;
  quantity: number;
  note?: string;
  selectedOptions?: string[];
  status: OrderStatus;
  placedAt: number;
  fulfilledAt?: number;
}

export interface RoomState {
  roomId: string;
  hostConnectionId: string | null;
  orders: Record<string, Order>;
  createdAt: number;
  closedAt?: number;
  roomName?: string;
  menu?: Menu;
}

export interface MenuItemOption {
  id: string;
  label: string;
  type: "checkbox";
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  available: boolean;
  freeText?: boolean;
  options?: MenuItemOption[];
}

export interface MenuCategory {
  id: string;
  label: string;
  items: MenuItem[];
}

export interface Menu {
  version: number;
  categories: MenuCategory[];
}

// --- Client → Server ---
export type ClientMessage =
  | { type: "host:claim"; roomName?: string }
  | { type: "guest:join"; guestId: string; guestName: string }
  | { type: "order:place"; order: Omit<Order, "id" | "status" | "fulfilledAt"> }
  | { type: "order:fulfill"; orderId: string }
  | { type: "order:unavailable"; orderId: string }
  | { type: "room:close" }
  | { type: "menu:update"; menu: Menu };

// --- Server → Client ---
export type ServerMessage =
  | { type: "room:state"; state: RoomState }
  | { type: "order:new"; order: Order }
  | { type: "order:updated"; order: Order }
  | { type: "room:closed" }
  | { type: "error"; code: string; message: string };
