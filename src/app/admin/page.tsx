"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/db";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Guest {
  id: number;
  name: string;
  telp: string;
  type: string;
  state: string;
  created_at?: string;
}

export default function GuestWithQR() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState<Omit<Guest, "id">>({
    name: "",
    telp: "",
    type: "",
    state: "0",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("data_tamu")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setGuests(data || []);
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.telp || !form.type) return;

    if (editingId) {
      const { error } = await supabase
        .from("data_tamu")
        .update(form)
        .eq("id", editingId);
      if (!error) {
        setEditingId(null);
        setForm({ name: "", telp: "", type: "", state: "0" });
        fetchGuests();
      }
    } else {
      const { error } = await supabase.from("data_tamu").insert([form]);
      if (!error) {
        setForm({ name: "", telp: "", type: "", state: "0" });
        fetchGuests();
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus?")) {
      await supabase.from("data_tamu").delete().eq("id", id);
      fetchGuests();
    }
  };

  const handleDownloadQR = (telp: string) => {
    const canvas = document.getElementById(`qr-${telp}`) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${telp}.png`;
    link.click();
  };

  const filteredGuests = guests.filter((g) =>
    [g.name, g.telp, g.type].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleMarkAsTaken = async (id: number) => {
    const { error } = await supabase
      .from("data_tamu")
      .update({ state: "1" })
      .eq("id", id);
    if (!error) fetchGuests();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Manajemen Data Tamu + QR</h1>

      {/* Form */}
      <div className="space-y-2 mb-6">
        <Input
          name="name"
          placeholder="Nama"
          value={form.name}
          onChange={handleChange}
        />
        <Input
          name="telp"
          placeholder="No. Telepon"
          value={form.telp}
          onChange={handleChange}
        />
        <Input
          name="type"
          placeholder="Tipe Tamu"
          value={form.type}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit}>
          {editingId ? "Update" : "Tambah"}
        </Button>
        {editingId && (
          <Button
            variant="ghost"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", telp: "", type: "", state: "0" });
            }}
          >
            Batal
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Cari nama, telepon, atau tipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nama</th>
              <th className="border px-2 py-1">Telp</th>
              <th className="border px-2 py-1">Tipe</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">QR Code</th>
              <th className="border px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((g) => (
              <tr key={g.id}>
                <td className="border px-2 py-1 text-center">{g.id}</td>
                <td className="border px-2 py-1">{g.name}</td>
                <td className="border px-2 py-1">{g.telp}</td>
                <td className="border px-2 py-1">{g.type}</td>
                <td className="border px-2 py-1 text-center">
                  {g.state === "1" ? "Sudah Ambil" : "Belum Ambil"}
                </td>
                <td className="border px-2 py-1 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <QRCodeCanvas
                      id={`qr-${g.telp}`}
                      value={g.telp}
                      size={150}
                      includeMargin={true}
                    />
                    <button
                      onClick={() => handleDownloadQR(g.telp)}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      Download QR
                    </button>
                  </div>
                </td>

                <td className="border px-2 py-1 space-y-1 text-center">
                  {g.state === "0" && (
                    <button
                      onClick={() => handleMarkAsTaken(g.id)}
                      className="block text-green-600 hover:underline text-sm"
                    >
                      Tandai Sudah Ambil
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="block text-red-600 hover:underline text-sm"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(g.id);
                      setForm({
                        name: g.name,
                        telp: g.telp,
                        type: g.type,
                        state: g.state,
                      });
                    }}
                    className="block text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filteredGuests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada hasil.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
