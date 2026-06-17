import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Copy, Check } from "lucide-react";
import { roomJoinUrl } from "../../lib/partykit";
import { ConnectionDot } from "../shared/ConnectionDot";

interface Props {
  roomId: string;
  sidebar?: boolean;
}

export function RoomHeader({ roomId, sidebar = false }: Props) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const joinUrl = roomJoinUrl(roomId);

  function copyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const qrSize = sidebar ? 240 : 200;

  return (
    <div className="bg-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Room Code</p>
          <p className="font-mono text-3xl font-bold text-white tracking-[0.2em]">{roomId}</p>
        </div>
        <ConnectionDot />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={copyCode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy code"}
        </button>
        {!sidebar && (
          <button
            onClick={() => setShowQr((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            {showQr ? "Hide QR" : "Show QR"}
          </button>
        )}
      </div>

      {(sidebar || showQr) && (
        <div className="mt-4 flex justify-center bg-white rounded-xl p-4">
          <QRCodeSVG value={joinUrl} size={qrSize} />
        </div>
      )}
    </div>
  );
}
