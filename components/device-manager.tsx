"use client";

import { Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

type Device = { id: string; label: string; lastSeenAt: string };

export function DeviceManager({ initialDevices }: { initialDevices: Device[] }) {
  const [devices, setDevices] = useState(initialDevices);
  const revoke = async (id: string) => {
    const response = await fetch("/api/devices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) {
      setDevices(current => current.filter(device => device.id !== id));
      localStorage.removeItem("coonto-alienista-offline");
      localStorage.removeItem("coonto-alienista-license-expires");
      if ("caches" in window) void Promise.all([caches.delete("coonto-protected-v1"), caches.delete("coonto-protected-v2")]);
      localStorage.removeItem("coonto-offline-user");
    }
  };
  return <div className="device-list">
    {devices.length === 0 ? <p>Nenhum aparelho autorizado para uso offline.</p> : devices.map(device => <div className="device-item" key={device.id}><Smartphone size={20}/><div><strong>{device.label}</strong><span>Último acesso: {new Date(device.lastSeenAt).toLocaleDateString("pt-BR")}</span></div><button aria-label={`Remover ${device.label}`} onClick={() => revoke(device.id)}><Trash2 size={18}/></button></div>)}
    <small>{devices.length}/2 aparelhos autorizados</small>
  </div>;
}
