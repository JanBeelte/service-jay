import { create } from "zustand";
import type { Menu } from "../lib/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type Role = "host" | "guest";

interface RoomStore {
  roomId: string | null;
  role: Role | null;
  connectionStatus: ConnectionStatus;
  roomClosed: boolean;
  roomName: string | null;
  menu: Menu | null;
  setRoom: (roomId: string, role: Role) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomClosed: () => void;
  setRoomName: (name: string | null) => void;
  setMenu: (menu: Menu | null) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  role: null,
  connectionStatus: "disconnected",
  roomClosed: false,
  roomName: null,
  menu: null,
  setRoom: (roomId, role) => set({ roomId, role, roomClosed: false, roomName: null, menu: null }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setRoomClosed: () => set({ roomClosed: true }),
  setRoomName: (roomName) => set({ roomName }),
  setMenu: (menu) => set({ menu }),
  reset: () =>
    set({ roomId: null, role: null, connectionStatus: "disconnected", roomClosed: false, roomName: null, menu: null }),
}));
