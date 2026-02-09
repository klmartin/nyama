"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
export default function AddPurchaseModal({ onClose, onSaved }) {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
const t = useTranslations('');
  const [form, setForm] = useState({
    vendor_id: "",
    product_id: "",
    quantity: "",
    price_per_unit: "",
    payment_status: "UNPAID",
    purchase_date: new Date().toISOString().slice(0, 10),
  });

  const total =
    Number(form.quantity || 0) * Number(form.price_per_unit || 0);

  // Load vendors & products
  useEffect(() => {
    fetch("/api/vendors").then((r) => r.json()).then(setVendors);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  const submit = async () => {
    if (
      !form.vendor_id ||
      !form.product_id ||
      !form.quantity ||
      !form.price_per_unit
    ) {
      alert("All fields are required");
      return;
    }

    await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        total_cost: total,
      }),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-[420px] p-6 text-gray-900">
        <h2 className="text-xl font-bold mb-4">{t("add_purchase")}</h2>

        {/* Vendor */}
        <select
          className="border p-2 w-full mb-3 text-black"
          value={form.vendor_id}
          onChange={(e) =>
            setForm({ ...form, vendor_id: e.target.value })
          }
        >
          <option value="">{t("select_vendor")}</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Product */}
        <select
          className="border p-2 w-full mb-3 text-black"
          value={form.product_id}
          onChange={(e) =>
            setForm({ ...form, product_id: e.target.value })
          }
        >
          <option value="">{t("select_product")}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <input
          type="number"
          step="0.01"
          className="border p-2 w-full mb-3 text-black"
          placeholder={t("quantity")}
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />

        {/* Price */}
        <input
          type="number"
          step="0.01"
          className="border p-2 w-full mb-3 text-black"
          placeholder={t("buying_price_per_unit")}
          value={form.price_per_unit}
          onChange={(e) =>
            setForm({ ...form, price_per_unit: e.target.value })
          }
        />

        {/* Total */}
        <div className="mb-3 font-semibold">
          {t("total_cost")}:{" "}
          <span className="text-red-600">{total.toLocaleString()}</span>
        </div>

        {/* Payment Status */}
        <select
          className="border p-2 w-full mb-4 text-black"
          value={form.payment_status}
          onChange={(e) =>
            setForm({ ...form, payment_status: e.target.value })
          }
        >
          <option value="UNPAID">{t("unpaid")}</option>
          <option value="PAID">{t("paid")}</option>
        </select>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
