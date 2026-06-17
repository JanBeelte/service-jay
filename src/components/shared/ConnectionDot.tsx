import { clsx } from "clsx";
import { useRoomStore } from "../../store/roomStore";

export function ConnectionDot() {
  const status = useRoomStore((s) => s.connectionStatus);

  return (
    <span
      className={clsx("inline-block w-2.5 h-2.5 rounded-full", {
        "bg-green-400": status === "connected",
        "bg-yellow-400 animate-pulse": status === "connecting",
        "bg-red-500": status === "disconnected",
      })}
      title={status}
    />
  );
}
