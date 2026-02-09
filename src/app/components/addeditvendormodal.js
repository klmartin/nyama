import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
export default function VendorModal({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    if (vendor) setForm(vendor);
  }, [vendor]);
const t = useTranslations('');
  const save = async () => {
    if (!form.name || !form.phone) {
      alert("Name and phone required");
      return;
    }

    await fetch("/api/vendors", {
      method: vendor ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96 text-black">
        <h2 className="text-xl font-bold mb-4">
          {vendor ? t("edit_vendor") : t("add_vendor")}
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder={t("vendor_name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder={t("phone")}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder={t("address")}
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder={t("email")}
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>{t("cancel")}</button>
          <button
            onClick={save}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
