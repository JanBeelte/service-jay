import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Link, X } from "lucide-react";
import { roomJoinUrl } from "../../lib/partykit";
import { ConnectionDot } from "../shared/ConnectionDot";

interface Props {
  roomId: string;
  sidebar?: boolean;
}

export function RoomHeader({ roomId, sidebar = false }: Props) {
  const [qrDialog, setQrDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const joinUrl = roomJoinUrl(roomId);

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function copyCode() {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  }

  const qrThumbnail = (
    <button
      onClick={() => setQrDialog(true)}
      className="bg-white rounded-lg p-1 hover:opacity-80 transition-opacity shrink-0"
      title="Enlarge QR code"
    >
      <QRCodeSVG value={joinUrl} size={56} />
    </button>
  );

  return (
    <>
      <div className="bg-slate-800 rounded-2xl p-5">
        {sidebar ? (
          <>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Room Code</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-3xl font-bold text-white tracking-[0.2em]">{roomId}</p>
                  <button onClick={copyCode} className="text-slate-500 hover:text-amber-400 transition-colors mt-0.5">
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <ConnectionDot />
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4" />}
                {copiedLink ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => setQrDialog(true)}
                className="flex justify-center bg-white rounded-xl p-4 hover:opacity-80 transition-opacity"
              >
                <QRCodeSVG value={joinUrl} size={240} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Room Code</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-3xl font-bold text-white tracking-[0.2em]">{roomId}</p>
                <button onClick={copyCode} className="text-slate-500 hover:text-amber-400 transition-colors mt-0.5">
                  {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-3">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4" />}
                  {copiedLink ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {qrThumbnail}
              <ConnectionDot />
            </div>
          </div>
        )}
      </div>

      {qrDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setQrDialog(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrDialog(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <QRCodeSVG value={joinUrl} size={280} />
          </div>
        </div>
      )}
    </>
  );
}
