import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGuestRoom } from "../hooks/useGuestRoom";
import { useRoomStore } from "../store/roomStore";
import { DrinkMenu } from "../components/guest/DrinkMenu";
import { GuestOrderList } from "../components/guest/GuestOrderList";
import { FulfilledBanner } from "../components/shared/FulfilledBanner";
import { ConnectionDot } from "../components/shared/ConnectionDot";
import { ArrowLeft } from "lucide-react";
import logo from "../../service-jay.png";

const LAST_ROOM_KEY = "lastGuestRoom";

function getStoredName(): string {
  return sessionStorage.getItem("guestName") ?? "";
}

function saveName(name: string) {
  sessionStorage.setItem("guestName", name);
}

export function saveLastRoom(roomId: string, guestName: string) {
  localStorage.setItem(LAST_ROOM_KEY, JSON.stringify({ roomId, guestName }));
}

export function clearLastRoom() {
  localStorage.removeItem(LAST_ROOM_KEY);
}

export default function GuestPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState(getStoredName);
  const [nameConfirmed, setNameConfirmed] = useState(() => getStoredName().length > 0);
  const [inputName, setInputName] = useState("");

  const roomClosed = useRoomStore((s) => s.roomClosed);
  const roomName = useRoomStore((s) => s.roomName);
  const menu = useRoomStore((s) => s.menu);

  // Only start the WS connection once we have a name
  const { placeOrder } = useGuestRoom(roomId!, nameConfirmed ? guestName : "");

  if (roomClosed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-white font-semibold text-lg">Room closed</p>
          <p className="text-slate-400 text-sm mt-1">The host has ended this session.</p>
          <button
            onClick={() => { clearLastRoom(); navigate("/"); }}
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
            <p className="text-3xl mb-2">👋</p>
            <h2 className="text-white font-bold text-xl">What's your name?</h2>
            <p className="text-slate-400 text-sm mt-1">So the host knows who ordered what</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = inputName.trim();
              if (name) {
                saveName(name);
                saveLastRoom(roomId!, name);
                setGuestName(name);
                setNameConfirmed(true);
              }
            }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Your name"
              maxLength={30}
              autoFocus
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={inputName.trim().length === 0}
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-900 font-semibold disabled:opacity-40"
            >
              Enter Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => { clearLastRoom(); navigate("/"); }}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-slate-500 text-xs">Room {roomId}</p>
        </div>
        <ConnectionDot />
      </header>

      <main className="flex-1 p-5 flex flex-col gap-5 max-w-lg mx-auto w-full pb-8">
        <div className="pt-2 pb-1 flex items-center gap-3">
          <img src={logo} alt="Service Jay" className="w-12 h-12 rounded-xl shrink-0" />
          <h1 className="text-white font-bold text-3xl leading-tight">{roomName ?? "Order Drinks"}</h1>
        </div>
        <GuestOrderList />
        <DrinkMenu menu={menu} onOrder={placeOrder} />
      </main>

      <FulfilledBanner />
    </div>
  );
}
