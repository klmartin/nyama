"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

 function AddEditProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    id: product?.id || null,
    name: product?.name || "",
    opening_stock: product?.opening_stock || "",
    unit: product?.unit || "KG",
    buying_price: product?.buying_price || "",
    selling_price: product?.selling_price || "",
    is_active: product?.is_active ?? true,
  });
 const t = useTranslations('');

  const submit = async () => {
    if (!form.name || !form.buying_price || !form.selling_price || !form.opening_stock) {
      alert("All fields required");
      return;
    }

    const method = form.id ? "PUT" : "POST";

    await fetch("/api/products", {
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
        <h2 className="text-xl font-bold mb-4">{form.id ? t("edit") : t("add_product")}</h2>

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("product_name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        
        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("opening_stock")}
          value={form.opening_stock}
          onChange={(e) => setForm({ ...form, opening_stock: e.target.value })}
        />

        <select
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        >
          <option value="KG">{t("kg")}</option>
          <option value="PIECE">{t("piece")}</option>
        </select>

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("buying_price")}
          type="number"
          value={form.buying_price}
          onChange={(e) => setForm({ ...form, buying_price: e.target.value })}
        />

        <input
          className="border border-gray-300 p-2 w-full mb-3 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={t("selling_price")}
          type="number"
          value={form.selling_price}
          onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
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
export default AddEditProductModal;