"use client";
import { useEffect, useState } from "react";

export default function AddSaleModal({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    customer_id: "",
    sale_date: new Date().toISOString().slice(0, 10),
    payment_status: "PAID",
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
    (sum, i) => sum + (i.quantity || 0) * (i.price_per_unit || 0),
    0
  );

  const submit = async () => {
    for (const item of form.items) {
      const product = products.find(p => p.id == item.product_id);
      if (Number(item.quantity) > product.remaining_stock) {
        alert("Not enough stock");
        return;
      }
    }
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-[520px] text-black space-y-4">
        <h2 className="text-xl font-bold">Add Sale</h2>

        <select
          className="border p-2 w-full"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {form.items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <select
              className="border p-2 flex-1"
              value={item.product_id}
              onChange={(e) => updateItem(i, "product_id", e.target.value)}
            >
              <option value="">Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input
              type="number"
              className="border p-2 w-20"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(i, "quantity", e.target.value)}
            />

            <input
              type="number"
              className="border p-2 w-28"
              placeholder="Price"
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
          + Add Item
        </button>

        <div className="font-semibold">
          Total: <span className="text-red-600">{total.toLocaleString()}</span>
        </div>

        <select
          className="border p-2 w-full"
          value={form.payment_status}
          onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
        >
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Save Sale
          </button>
        </div>
      </div>
    </div>
  );
}
