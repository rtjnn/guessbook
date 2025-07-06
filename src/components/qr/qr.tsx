"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (text: string) => void;
}

export default function BarcodeScanner({ onScan }: Props) {
  const [isScannerReady, setIsScannerReady] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isScannerReady && !hasStartedRef.current) {
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
  }, [isScannerReady, onScan]);

  // Tunggu sampai elemen div dirender
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.getElementById("reader")) {
        setIsScannerReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[320px] mx-auto relative">
      <div id="reader" className="rounded-md overflow-hidden shadow-md" />
      
    </div>
  );
}
