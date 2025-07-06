"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator() {
  const [text, setText] = useState("Halo Dunia");

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 w-full"
        placeholder="Masukkan teks (varchar)..."
      />
      <div>
        <QRCodeCanvas value={text} size={256} />
      </div>
    </div>
  );
}
