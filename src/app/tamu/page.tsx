"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "@/lib/db";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface Guest {
  id: number;
  name: string;
  telp: string;
  type: string;
  state: string;
  created_at?: string;
}

export default function GuestByTelpPage() {
  const searchParams = useSearchParams();
  const telp = searchParams.get("telp");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuestByTelp = async () => {
      if (!telp) return;

      const { data, error } = await supabase
        .from("data_tamu")
        .select("*")
        .eq("telp", telp)
        .single();

      if (!error) {
        setGuest(data);
      }

      setLoading(false);
    };

    fetchGuestByTelp();
  }, [telp]);

  const handleDownloadQR = () => {
    const canvas = document.getElementById("guest-qr") as HTMLCanvasElement;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `qr-${telp}.png`;
    link.click();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Button size="lg" disabled>
          <Loader2Icon className="animate-spin" />
          Please wait
        </Button>
      </div>
    );
  if (!guest)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Tamu tidak ditemukan
          </h2>
          <p className="text-gray-500">
            Silakan periksa kembali ID atau nomor telepon tamu.
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">
        Detail Tamu
      </h1>

      <ul className="space-y-3 text-gray-700">
        <li>
          <span className="font-semibold">👤 Nama:</span> {guest.name}
        </li>
        <li>
          <span className="font-semibold">📞 Telepon:</span> {guest.telp}
        </li>
        <li>
          <span className="font-semibold">🕒 Dibuat:</span>{" "}
          {new Date(guest.created_at || "").toLocaleString()}
        </li>
      </ul>

      <div className="mt-8 flex flex-col items-center text-center">
        <p className="font-semibold text-gray-800 mb-3">QR Code:</p>
        <QRCodeCanvas
          id="guest-qr"
          value={guest.telp}
          size={180}
          includeMargin
        />
        <div className="mt-4">
          <Button
            onClick={handleDownloadQR}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Download QR
          </Button>
        </div>
      </div>
    </div>
  );
}
