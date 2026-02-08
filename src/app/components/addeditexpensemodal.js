"use client";
import { useState } from "react";

export default function AddEditExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: expense?.title || "",
    category: expense?.category || "",
    amount: expense?.amount || "",
    expense_date:
      expense?.expense_date ||
      new Date().toISOString().slice(0, 10),
    payment_method: expense?.payment_method || "CASH",
    notes: expense?.notes || "",
  });

  async function submit() {
    const method = expense ? "PUT" : "POST";

    await fetch("/api/expenses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: expense?.id }),
    });

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-[420px] p-6 text-black">
        <h2 className="text-xl font-bold mb-4">
          {expense ? "Edit Expense" : "Add Expense"}
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        />

        <input
          type="number"
          className="border p-2 w-full mb-3"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={form.expense_date}
          onChange={(e) =>
            setForm({ ...form, expense_date: e.target.value })
          }
        />

        <select
          className="border p-2 w-full mb-3"
          value={form.payment_method}
          onChange={(e) =>
            setForm({ ...form, payment_method: e.target.value })
          }
        >
          <option value="CASH">Cash</option>
          <option value="MOBILE">Mobile</option>
          <option value="BANK">Bank</option>
        </select>

        <textarea
          className="border p-2 w-full mb-4"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
