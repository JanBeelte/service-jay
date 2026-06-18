import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHostRoom } from "../hooks/useHostRoom";
import { useRoomStore } from "../store/roomStore";
import { RoomHeader } from "../components/host/RoomHeader";
import { OrderList } from "../components/host/OrderList";
import { MenuEditor } from "../components/host/MenuEditor";
import { LogOut, UtensilsCrossed } from "lucide-react";
import logo from "../../service-jay.png";

function getStoredRoomName(): string {
  return sessionStorage.getItem("roomName") ?? "";
}

function saveRoomName(name: string) {
  sessionStorage.setItem("roomName", name);
}

export default function HostPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState(getStoredRoomName);
  const [nameConfirmed, setNameConfirmed] = useState(() => getStoredRoomName().length > 0);
  const [inputName, setInputName] = useState("Service-Jay");

  const [menuEditorOpen, setMenuEditorOpen] = useState(false);
  const { fulfillOrder, markUnavailable, closeRoom, updateMenu } = useHostRoom(roomId!, nameConfirmed ? roomName : "");
  const roomClosed = useRoomStore((s) => s.roomClosed);
  const serverMenu = useRoomStore((s) => s.menu);

  function getEditorMenu() {
    if (serverMenu) return serverMenu;
    const stored = localStorage.getItem(`menu:${roomId}`);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return null;
  }

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

  if (!nameConfirmed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col gap-5">
          <div className="text-center">
            <p className="text-3xl mb-2">🏷️</p>
            <h2 className="text-white font-bold text-xl">Name this room</h2>
            <p className="text-slate-400 text-sm mt-1">Guests will see this name when they join</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = inputName.trim();
              if (name) {
                saveRoomName(name);
                setRoomName(name);
                setNameConfirmed(true);
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="e.g. Friday Night Drinks"
              maxLength={50}
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={inputName.trim().length === 0}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold disabled:opacity-40"
            >
              Open Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Service Jay" className="w-10 h-10 rounded-xl shrink-0" />
          <div>
            <h1 className="text-white font-bold text-2xl leading-tight">{roomName}</h1>
            <p className="text-slate-500 text-xs">Host Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuEditorOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-sm"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Edit Menu
          </button>
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
        </div>
      </header>

      {menuEditorOpen && (
        <MenuEditor
          currentMenu={getEditorMenu()}
          onSave={(menu) => {
            updateMenu(menu);
            setMenuEditorOpen(false);
          }}
          onClose={() => setMenuEditorOpen(false)}
        />
      )}

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
