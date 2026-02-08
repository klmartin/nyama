"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AddEditCustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    id: customer?.id || null,
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    email: customer?.email || "",
    balance: customer?.balance || 0,
    is_active: customer?.is_active ?? true,
  });
 const t = useTranslations('');

  const submit = async () => {
    if (!form.name || !form.phone) {
      alert("Name and Phone are required");
      return;
    }

    const method = form.id ? "PUT" : "POST";

    await fetch("/api/customers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 text-gray-900 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{form.id ? t("edit_customer") : t("add_customer")}</h2>

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("phone")}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("address")}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("email")}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="number"
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("balance")}
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
        />

        {form.id && (
          <div className="mb-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              {t("active")}
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
          >
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {form.id ? t("update") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
