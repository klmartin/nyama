import { useState } from "react";

export default function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    role: user?.role || "SELLER",
    is_active: user?.is_active ?? 1,
  });

  async function save() {
    const method = user ? "PUT" : "POST";
    const url = user ? `/api/users/${user.id}` : "/api/users";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 text-black space-y-3">
        <h2 className="font-bold text-lg">
          {user ? "Edit User" : "Add User"}
        </h2>

        <input className="border p-2 w-full" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input className="border p-2 w-full" placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })} />

        <input className="border p-2 w-full" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input className="border p-2 w-full" placeholder="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <input className="border p-2 w-full" placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <select className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="ADMIN">ADMIN</option>
          <option value="SELLER">SELLER</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button onClick={save}
            className="bg-red-700 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}