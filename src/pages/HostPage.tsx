import { useParams, useNavigate } from "react-router-dom";
import { useHostRoom } from "../hooks/useHostRoom";
import { useRoomStore } from "../store/roomStore";
import { RoomHeader } from "../components/host/RoomHeader";
import { OrderList } from "../components/host/OrderList";
import { LogOut } from "lucide-react";

export default function HostPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { fulfillOrder, markUnavailable, closeRoom } = useHostRoom(roomId!);
  const roomClosed = useRoomStore((s) => s.roomClosed);

  if (roomClosed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-white font-semibold text-lg">Room closed</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-white font-bold text-lg">Host Dashboard</h1>
        <button
          onClick={() => {
            if (confirm("Close this room? All guests will be disconnected.")) {
              closeRoom();
            }
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Close Room
        </button>
      </header>

      {/* Mobile: single column */}
      <main className="flex-1 p-5 flex flex-col gap-5 max-w-lg mx-auto w-full md:hidden">
        <RoomHeader roomId={roomId!} />
        <OrderList onFulfill={fulfillOrder} onUnavailable={markUnavailable} />
      </main>

      {/* Tablet+: two columns */}
      <div className="hidden md:flex flex-1 gap-0 overflow-hidden">
        <section className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-4">Orders</h2>
          <div className="max-w-xl">
            <OrderList onFulfill={fulfillOrder} onUnavailable={markUnavailable} />
          </div>
        </section>
        <aside className="w-80 shrink-0 border-l border-slate-800 p-6 overflow-y-auto sticky top-0 self-start h-[calc(100vh-57px)]">
          <RoomHeader roomId={roomId!} sidebar />
        </aside>
      </div>
    </div>
  );
}
