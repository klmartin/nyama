"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AddSaleModal({ onClose, onSaved }) {
  const t = useTranslations('');

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_status: "PAID",
    amount_paid: "",           // new field for partial payments
    items: [
      { product_id: "", quantity: "", price_per_unit: "" }
    ],
  });

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(setCustomers);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  const updateItem = (index, key, value) => {
    const items = [...form.items];
    items[index][key] = value;

    if (key === "product_id") {
      const p = products.find(pr => pr.id == value);
      items[index].price_per_unit = p?.selling_price || "";
    }

    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: "", price_per_unit: "" }],
    });
  };

  const removeItem = (i) => {
    setForm({
      ...form,
      items: form.items.filter((_, idx) => idx !== i),
    });
  };

  const total = form.items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price_per_unit) || 0),
    0
  );

  const submit = async () => {
    setError("");

    // Validation
    if (!form.customer_id) {
      setError("Please select a customer");
      return;
    }

    if (form.items.length === 0 || form.items.some(i => !i.product_id || !i.quantity || Number(i.quantity) <= 0)) {
      setError("All items must have product and valid quantity");
      return;
    }

    // Check stock
    for (const item of form.items) {
      const product = products.find(p => p.id == item.product_id);
      if (!product) {
        setError("Product not found");
        return;
      }
      if (Number(item.quantity) > Number(product.stock_quantity || product.remaining_stock || 0)) {
        setError(`Not enough stock for ${product.name}`);
        return;
      }
    }

    let amountPaid = 0;

    if (form.payment_status === "PAID") {
      amountPaid = total;
    } else if (form.payment_status === "PARTIAL") {
      amountPaid = Number(form.amount_paid) || 0;
      if (amountPaid <= 0 || amountPaid >= total) {
        setError("Partial amount must be greater than 0 and less than total");
        return;
      }
    } // UNPAID → amountPaid = 0

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: form.customer_id,
          sale_date: form.sale_date,
          payment_status: form.payment_status,
          amount_paid: amountPaid,
          items: form.items.map(item => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            price_per_unit: Number(item.price_per_unit),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create sale");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      setError("Network error - please try again");
      console.error(err);
    }
  };

  const remaining = total - (form.payment_status === "PARTIAL" ? Number(form.amount_paid || 0) : 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[520px] text-black space-y-4">

        <h2 className="text-xl font-bold">{t("add_sale")}</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <select
          className="border p-2 w-full"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
        >
          <option value="">{t("select_customer")}</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {form.items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              className="border p-2 flex-1"
              value={item.product_id}
              onChange={(e) => updateItem(i, "product_id", e.target.value)}
            >
              <option value="">{t("select_product")}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input
              type="number"
              className="border p-2 w-20"
              placeholder={t("quantity")}
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", e.target.value)}
            />

            <input
              type="number"
              className="border p-2 w-28"
              placeholder={t("price_per_unit")}
              value={item.price_per_unit}
              onChange={(e) => updateItem(i, "price_per_unit", e.target.value)}
            />

            {form.items.length > 1 && (
              <button
                onClick={() => removeItem(i)}
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addItem}
          className="text-sm text-blue-600"
        >
          + {t("add_item")}
        </button>

        <div className="font-semibold">
          {t("total")}: <span className="text-red-600">{total.toLocaleString()}</span>
        </div>

        <select
          className="border p-2 w-full"
          value={form.payment_status}
          onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
        >
          <option value="PAID">{t("paid")}</option>
          <option value="PARTIAL">{t("partial") || "Partial"}</option>
          <option value="UNPAID">{t("unpaid")}</option>
        </select>

        {form.payment_status === "PARTIAL" && (
          <div className="space-y-2">
            <input
              type="number"
              className="border p-2 w-full"
              placeholder={t("amount_paid") || "Amount Paid Now"}
              value={form.amount_paid}
              onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
            />
            {Number(form.amount_paid) > 0 && Number(form.amount_paid) < total && (
              <div className="text-sm text-amber-700">
                Remaining: {remaining.toLocaleString()}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}