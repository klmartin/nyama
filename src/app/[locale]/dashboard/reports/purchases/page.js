"use client";
import { useState } from "react";

export default function PurchasesReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    const res = await fetch(
      `/api/reports/purchases?from=${from}&to=${to}`
    );
    const json = await res.json();
    setData(json.rows);
    setTotal(json.total);
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-black">
        Purchases Report
      </h1>

      {/* Filters */}
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm font-semibold text-black">
            From Date
          </label>
          <input
            type="date"
            className="border p-2 rounded text-black"
            onChange={e => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black">
            To Date
          </label>
          <input
            type="date"
            className="border p-2 rounded text-black"
            onChange={e => setTo(e.target.value)}
          />
        </div>

        <button
          onClick={load}
          className="bg-red-700 text-white px-4 py-2 rounded"
        >
          Generate
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} className="border-t">
                <td className="p-3 text-black">{row.supplier}</td>
                <td className="p-3 text-black">{row.product}</td>
                <td className="p-3 text-black">{row.quantity}</td>
                <td className="p-3 text-black text-right">
                  {row.total_amount}
                </td>
                <td className="p-3 text-black">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right font-bold text-black">
        Total Purchases Amount: {total}
      </div>
    </div>
  );
}
