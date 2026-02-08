"use client";

import { useEffect, useState } from "react";

export default function ExpensesReport() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");

  const fetchExpenses = async () => {
    const params = new URLSearchParams();

    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (category) params.append("category", category);

    const res = await fetch(`/api/reports/expenses?${params.toString()}`);
    const data = await res.json();

    setExpenses(data.expenses);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Expenses Report
      </h1>

      {/* Summary */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-2xl font-bold text-red-600">
          {Number(total).toLocaleString()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded text-black"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded text-black"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded text-black"
        />

        <button
          onClick={fetchExpenses}
          className="bg-red-700 text-white px-4 rounded"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}

            {expenses.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3 text-black">
                  {e.expense_date}
                </td>
                <td className="p-3 text-black">
                  {e.title}
                </td>
                <td className="p-3 text-black">
                  {e.category}
                </td>
                <td className="p-3 text-right text-red-600">
                  {Number(e.amount).toLocaleString()}
                </td>
                <td className="p-3 text-black">
                  {e.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
