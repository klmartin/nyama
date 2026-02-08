"use client";
import { useEffect, useState } from "react";
import AddEditExpenseModal from "@/app/components/addeditexpensemodal";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const res = await fetch("/api/expenses");
    setExpenses(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Delete this expense?")) return;

    await fetch("/api/expenses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    load();
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">Expenses</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShow(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          + Add Expense
        </button>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-black">
                  {new Date(e.expense_date).toLocaleDateString()}
                </td>
                <td className="p-3 text-black">{e.title}</td>
                <td className="p-3 text-black">{e.category}</td>
                <td className="p-3 text-black">{e.payment_method}</td>
                <td className="p-3 text-right font-semibold text-black">
                  {Number(e.amount).toLocaleString()}
                </td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditing(e);
                      setShow(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <AddEditExpenseModal
          expense={editing}
          onClose={() => setShow(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
