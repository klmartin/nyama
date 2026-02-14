"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ExpenseCategorySelect from "./expenseCategorySelect";

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

 const t = useTranslations('');

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
          {expense ? t("edit_expense") : t("add_expense")}
        </h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder={t("title")}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* <input
          className="border p-2 w-full mb-3"
          placeholder={t("category")}
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        /> */}

        <ExpenseCategorySelect 
          value={form.category}
          onChange={(e) => setFormData({...form, category: e.target.value})}
          className="border p-2 w-full mb-3"
        />

        <input
          type="number"
          className="border p-2 w-full mb-3"
          placeholder={t("amount")}
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
          <option value="CASH">{t("cash")}</option>
          <option value="MOBILE">{t("mobile")}</option>
          <option value="BANK">{t("bank")}</option>
        </select>

        <textarea
          className="border p-2 w-full mb-4"
          placeholder={t("notes")}
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
            {t("cancel")}
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
