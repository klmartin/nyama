import { useState } from "react";
import { useTranslations } from "next-intl";

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
 const t = useTranslations('');

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
          {user ? t("edit_user") : t("add_user")}
        </h2>

        <input className="border p-2 w-full" placeholder={t("name")}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <input className="border p-2 w-full" placeholder={t("username")}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />

        <input className="border p-2 w-full" placeholder={t("email")}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />

        <input className="border p-2 w-full" placeholder={t("phone")}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <input className="border p-2 w-full" placeholder={t("password")}
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <select className="border p-2 w-full"
          onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="ADMIN">{t("admin")}</option>
          <option value="SELLER">{t("seller")}</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>{t("cancel")}</button>
          <button onClick={save}
            className="bg-red-700 text-white px-4 py-2 rounded">
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}