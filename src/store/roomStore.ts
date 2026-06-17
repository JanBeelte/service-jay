import { create } from "zustand";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
export type Role = "host" | "guest";

interface RoomStore {
  roomId: string | null;
  role: Role | null;
  connectionStatus: ConnectionStatus;
  roomClosed: boolean;
  setRoom: (roomId: string, role: Role) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomClosed: () => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  role: null,
  connectionStatus: "disconnected",
  roomClosed: false,
  setRoom: (roomId, role) => set({ roomId, role }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setRoomClosed: () => set({ roomClosed: true }),
  reset: () =>
    set({ roomId: null, role: null, connectionStatus: "disconnected", roomClosed: false }),
}));
