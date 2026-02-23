"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AddPurchaseModal({ onClose, onSaved }) {
  const t = useTranslations("");

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [buyingPrice, setBuyingPrice] = useState(0);

  const [form, setForm] = useState({
    vendor_id: "",
    product_id: "",
    quantity: "",
    payment_status: "UNPAID",
    amount_paid: "",
    purchase_date: new Date().toISOString().slice(0, 10),
  });

  const [error, setError] = useState("");

  // Load vendors & products
  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then(setVendors);

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
      });
  }, []);

  // When product changes → use buying_price (not selling_price)
  const handleProductChange = (e) => {
    const productId = e.target.value;

    const selected = products.find(
      (p) => String(p.id) === String(productId)
    );

    if (selected) {
      setBuyingPrice(parseFloat(selected.buying_price) || 0);
    } else {
      setBuyingPrice(0);
    }

    setForm((prev) => ({
      ...prev,
      product_id: productId,
    }));
  };

  const total =
    parseFloat(form.quantity || 0) * parseFloat(buyingPrice || 0);

  const submit = async () => {
    setError("");

    if (!form.vendor_id || !form.product_id || !form.quantity) {
      setError("All fields are required");
      return;
    }

    const qty = parseFloat(form.quantity);
    if (qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    let amountPaid = 0;

    if (form.payment_status === "PAID") {
      amountPaid = total;
    }

    if (form.payment_status === "PARTIAL") {
      amountPaid = parseFloat(form.amount_paid || 0);

      if (amountPaid <= 0 || amountPaid >= total) {
        setError("Partial amount must be greater than 0 and less than total");
        return;
      }
    }

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: form.vendor_id,
          product_id: form.product_id,
          quantity: qty,
          purchase_date: form.purchase_date,
          payment_status: form.payment_status,
          amount_paid: amountPaid,
          // NO buying_price or total_cost here — backend calculates them
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create purchase");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      setError("Network error - could not reach server");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[480px] p-6 text-gray-900">
        <h2 className="text-xl font-bold mb-5">
          {t("add_purchase")}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Vendor */}
        <select
          className="border p-3 w-full mb-3 rounded-lg"
          value={form.vendor_id}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              vendor_id: e.target.value,
            }))
          }
        >
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Product */}
        <select
          className="border p-3 w-full mb-3 rounded-lg"
          value={form.product_id}
          onChange={handleProductChange}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Buying Price Display */}
        <div className="bg-gray-50 border p-3 rounded-lg mb-3">
          <p className="text-sm text-gray-500">
            Buying Price (Auto)
          </p>
          <p className="font-semibold">
            {buyingPrice.toLocaleString()}
          </p>
        </div>

        {/* Quantity */}
        <input
          type="number"
          step="0.01"
          className="border p-3 w-full mb-3 rounded-lg"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              quantity: e.target.value,
            }))
          }
        />

        {/* Total */}
        <div className="bg-gray-100 p-3 rounded-lg mb-4 border">
          <p className="text-sm text-gray-500">
            Total Cost
          </p>
          <p className="text-xl font-bold text-red-600">
            {total.toLocaleString()}
          </p>
        </div>

        {/* Payment Status */}
        <select
          className="border p-3 w-full mb-3 rounded-lg"
          value={form.payment_status}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              payment_status: e.target.value,
            }))
          }
        >
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>

        {/* Partial Field */}
        {form.payment_status === "PARTIAL" && (
          <input
            type="number"
            step="0.01"
            className="border p-3 w-full mb-3 rounded-lg"
            placeholder="Amount Paid"
            value={form.amount_paid}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                amount_paid: e.target.value,
              }))
            }
          />
        )}

        {/* Remaining Preview */}
        {form.payment_status === "PARTIAL" && (
          <div className="bg-yellow-50 border p-3 rounded-lg mb-4">
            Remaining:{" "}
            {(total - parseFloat(form.amount_paid || 0)).toLocaleString()}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}