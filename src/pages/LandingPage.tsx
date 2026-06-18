import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateRoomId } from "../lib/roomId";
import { RoomIdInput } from "../components/shared/RoomIdInput";
import { Martini, QrCode } from "lucide-react";

const QRScanner = lazy(() =>
  import("../components/guest/QRScanner").then((m) => ({ default: m.QRScanner }))
);

type Tab = "create" | "join";

export default function LandingPage() {
  const [tab, setTab] = useState<Tab>("create");
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  function handleCreateRoom() {
    const roomId = generateRoomId();
    navigate(`/host/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Martini className="w-9 h-9 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Service Jay</h1>
          <p className="text-slate-400 text-sm text-center">Order drinks right from your table</p>
        </div>

        {/* Tabs */}
        <div className="w-full bg-slate-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "create"
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Host a Room
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "join"
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Join a Room
            </button>
          </div>

          {tab === "create" && (
            <div className="flex flex-col gap-4">
              <p className="text-slate-400 text-sm text-center">
                Create a room and share the code with your guests.
              </p>
              <button
                onClick={handleCreateRoom}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-lg transition-colors active:scale-95"
              >
                Create Room
              </button>
            </div>
          )}

          {tab === "join" && (
            <div className="flex flex-col gap-4">
              <RoomIdInput />
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs">or</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <button
                onClick={() => setScannerOpen((v) => !v)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                {scannerOpen ? "Close Scanner" : "Scan QR Code"}
              </button>

              {scannerOpen && (
                <Suspense fallback={<div className="text-slate-500 text-sm text-center">Loading camera…</div>}>
                  <QRScanner />
                </Suspense>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
