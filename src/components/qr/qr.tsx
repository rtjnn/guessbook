"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface Props {
  onScan: (text: string) => void;
  active: boolean;
}

export default function BarcodeScanner({ onScan, active }: Props) {
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (active && !hasStartedRef.current) {
      const element = document.getElementById("reader");
      if (!element) return;

      hasStartedRef.current = true;

      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
        },
        () => {}
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [active, onScan]);

  return (
    <div className="w-full max-w-[320px] mx-auto relative">
      <div id="reader" className="rounded-md overflow-hidden shadow-md" />
    </div>
  );
}
