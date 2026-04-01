"use client";

import React, { useState } from "react";

type Props = {
  initialName?: string | null;
  initialImage?: string | null;
};

export function ProfileForm({ initialName = "", initialImage = null }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving...");

    const fd = new FormData();
    fd.set("name", name);
    if (file) fd.set("image", file);

    try {
      const res = await fetch("/api/profile", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error ?? "Error");
        return;
      }

      setStatus("Saved");
      setImagePreview(data.user.image ?? null);
    } catch {
      setStatus("Network error");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (f) {
      const url = URL.createObjectURL(f);
      setImagePreview(url);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-stone-100">
          {imagePreview ? <img src={imagePreview} alt="avatar" className="h-20 w-20 object-cover" /> : <div className="h-20 w-20" />}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold">Име</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          <label className="mt-3 block text-sm font-semibold">Профилна снимка</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Запази</button>
        {status ? <p className="text-sm text-stone-700">{status}</p> : null}
      </div>
    </form>
  );
}
