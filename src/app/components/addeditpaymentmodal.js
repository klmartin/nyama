"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AddPaymentModal({ type, onClose, onSaved }) {
  const t = useTranslations("");

  const [entities, setEntities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    payment_method: "CASH",
    payment_date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [error, setError] = useState("");

  const isCustomer = type === "CUSTOMER";
  const totalField  = isCustomer ? "total_amount"  : "total_cost";
  const paidField   = isCustomer ? "paid_amount"   : "paid_amount";
  const idField     = isCustomer ? "sale_id"       : "id";   // ← NEW: dynamic ID field

  useEffect(() => {
    fetch(isCustomer ? "/api/customers" : "/api/vendors")
      .then((r) => r.json())
      .then(setEntities);
  }, [type]);

  useEffect(() => {
    if (!selectedEntity) return;

    const url = isCustomer
      ? `/api/sales?customer_id=${selectedEntity}&status=OPEN`
      : `/api/purchases?vendor_id=${selectedEntity}&status=OPEN`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch transactions");
        return r.json();
      })
      .then(setTransactions)
      .catch((err) => setError(err.message || "Failed to load open transactions"));
  }, [selectedEntity, type]);

  const submit = async () => {
    setError("");

    if (!selectedTransaction || !form.amount) {
      // alert("im here");  // ← comment out or remove after testing
      setError("Missing fields");
      return;
    }

    const total  = Number(selectedTransaction[totalField]) || 0;
    const paid   = Number(selectedTransaction[paidField])  || 0;
    const remaining = total - paid;

    const amount = parseFloat(form.amount);

    if (isNaN(amount) || amount <= 0) {
      setError("Invalid amount");
      return;
    }

    if (amount > remaining) {
      setError("Payment exceeds remaining balance");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          reference_id: selectedTransaction[idField],   // ← use dynamic idField
          amount,
          payment_method: form.payment_method,
          payment_date: form.payment_date,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to record payment");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      setError("Network error – please check console");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[450px] shadow-lg text-gray-900">

        <h2 className="text-xl font-bold mb-4">
          {t("add")} {isCustomer ? t("customer") : t("vendor")} {t("payment")}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <select
          className="border p-2 w-full mb-3 rounded text-black"
          onChange={(e) => {
            setSelectedEntity(e.target.value);
            setSelectedTransaction(null);
            setTransactions([]);
          }}
        >
          <option value="">{t("select")}</option>
          {entities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        {selectedEntity && (
          <select
            className="border p-2 w-full mb-3 rounded text-black"
            onChange={(e) => {
              const tx = transactions.find(
                (t) => String(t[idField]) === String(e.target.value)
              );
              setSelectedTransaction(tx);
            }}
          >
            <option value="">{t("select_transaction")}</option>
            {transactions.map((tx) => {
              const total = Number(tx[totalField]) || 0;
              const paid  = Number(tx[paidField])  || 0;
              const remaining = total - paid;

              return (
                <option key={tx[idField]} value={tx[idField]}>
                  #{tx[idField]} — {remaining.toLocaleString(undefined, {minimumFractionDigits: 0})} {t("remaining")}
                </option>
              );
            })}
          </select>
        )}

        {selectedTransaction && (
          <div className="bg-gray-100 p-3 rounded mb-3 text-sm">
            <p>
              {t("total")}: {Number(selectedTransaction[totalField] || 0).toLocaleString()}
            </p>
            <p>
              {t("paid")}: {Number(selectedTransaction[paidField] || 0).toLocaleString()}
            </p>
            <p className="font-bold text-red-600">
              {t("remaining")}: {(Number(selectedTransaction[totalField] || 0) - Number(selectedTransaction[paidField] || 0)).toLocaleString()}
            </p>
          </div>
        )}

        <input
          type="number"
          className="border p-2 w-full mb-3 rounded text-black"
          placeholder={t("amount")}
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3 rounded text-black"
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
        >
          <option value="CASH">{t("cash")}</option>
          <option value="MOBILE">{t("mobile")}</option>
          <option value="BANK">{t("bank")}</option>
        </select>

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded text-black"
          placeholder={t("notes")}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border"
          >
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