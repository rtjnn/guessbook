"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/db";
import { Iguess } from "./types/guess";
import BarcodeScanner from "@/components/qr/qr";

export default function Home() {
  const [inputCode, setInputCode] = useState("");
  const [guestData, setGuestData] = useState<Iguess[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanMode, setScanMode] = useState(true);
  const [scannerKey, setScannerKey] = useState(0);

  const fetchGuestByCode = async (code: string) => {
    setLoading(true);
    setErrorMsg("");
    setGuestData([]);

    if (!code.trim()) {
      setErrorMsg("Kode tidak boleh kosong.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("data_tamu")
        .select("*")
        .eq("telp", code);

      if (error) {
        console.error("Supabase error:", error.message);
        setErrorMsg("Gagal mengambil data dari Supabase.");
      } else if (!data || data.length === 0) {
        setErrorMsg("Data tidak ditemukan.");
      } else {
        setGuestData(data);
        setScanMode(false); // Nonaktifkan scanner
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("Terjadi kesalahan tak terduga.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuestByCode(inputCode);
  };

  const handleScanResult = (scannedText: string) => {
    setInputCode(scannedText);
    fetchGuestByCode(scannedText);
  };

  const handleClear = () => {
    setInputCode("");
    setGuestData([]);
    setErrorMsg("");
    setScanMode(true);
    setScannerKey((prev) => prev + 1);
  };

  const handleMarkAsTaken = async (telp: string) => {
    if (!telp.trim()) {
      alert("Nomor telepon tidak valid.");
      return;
    }

    try {
      const { error } = await supabase
        .from("data_tamu")
        .update({ state: "1" })
        .eq("telp", telp);

      if (error) {
        console.error("Update error:", error.message);
        alert("Gagal menandai sebagai sudah ambil.");
      } else {
        const { data } = await supabase
          .from("data_tamu")
          .select("*")
          .eq("telp", telp);
        setGuestData(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Terjadi kesalahan saat update.");
    }
  };

  return (
    <div className="container py-10 px-4 max-w-lg mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Cek Data Tamu
        </h1>

        {/* Form Input */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <Input
            type="text"
            placeholder="Masukkan nomor telepon"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              // Jangan ubah scanMode di sini
            }}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="sm:w-auto w-full">
            {loading ? "Mencari..." : "Cari"}
          </Button>
        </form>

        {/* QR Scanner */}
        {scanMode && (
          <div className="flex justify-center mt-4">
            <BarcodeScanner key={scannerKey} onScan={handleScanResult} />
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="text-red-600 bg-red-100 border border-red-300 rounded-md p-3 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Guest Data */}
        {guestData.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h2 className="font-semibold text-gray-700 text-lg mb-2 border-b pb-1">
              Data Tamu:
            </h2>
            <ul className="space-y-3">
              {guestData.map((item, index) => (
                <li key={index} className="text-gray-800 border-b pb-3">
                  <p>
                    <span className="font-medium">Nama:</span> {item.name}
                  </p>
                  <p>
                    <span className="font-medium">Telp:</span> {item.telp}
                  </p>
                  <p>
                    <span className="font-medium">Tipe:</span> {item.type}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={
                        item.state === "1"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {item.state === "1" ? "Sudah Ambil" : "Belum Ambil"}
                    </span>
                  </p>

                  {/* Tombol Ambil */}
                  {item.state !== "1" && (
                    <div className="mt-2">
                      <Button
                        variant="default"
                        onClick={() => handleMarkAsTaken(item.telp)}
                        size="sm"
                      >
                        Tandai Sudah Ambil
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Clear Button */}
        {(guestData.length > 0 || errorMsg) && (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClear}>
              Clear & Scan Lagi
            </Button>
          </div>
        )}
      </div>
      <div className="container">
        <a
          href="/admin"
          className="block w-full text-center bg-indigo-500 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200 mt-6"
        >
          Admin
        </a>

        <p className="text-center text-sm text-gray-500 mt-6">
          made with ❤️ 2025
        </p>
      </div>
    </div>
  );
}
