import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function QRScanner() {
  const divRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let stopped = false;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (stopped || !divRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            // Extract room ID from URL hash or plain 6-char code
            const match = decodedText.match(/\/guest\/([A-Z0-9]{6})/i);
            if (match) {
              scanner.stop().catch(() => {});
              navigate(`/guest/${match[1].toUpperCase()}`);
            } else if (/^[A-Z0-9]{6}$/i.test(decodedText.trim())) {
              scanner.stop().catch(() => {});
              navigate(`/guest/${decodedText.trim().toUpperCase()}`);
            }
          },
          () => {}
        )
        .catch(() => {});
    });

    return () => {
      stopped = true;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="qr-reader"
        ref={divRef}
        className="w-full max-w-xs rounded-xl overflow-hidden"
      />
      <p className="text-slate-500 text-xs text-center">
        Point camera at the host's QR code
      </p>
    </div>
  );
}
