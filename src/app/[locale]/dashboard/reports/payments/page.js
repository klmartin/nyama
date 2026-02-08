"use client";
import { useState } from "react";

export default function PaymentsReport() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await fetch(`/api/reports/payments?${params}`);
    const json = await res.json();
    setRows(json);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Payments Report
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded text-black"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All</option>
          <option value="CUSTOMER">Customer Payments</option>
          <option value="VENDOR">Vendor Payments</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded text-black"
          onChange={(e) => setFrom(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded text-black"
          onChange={(e) => setTo(e.target.value)}
        />

        <button
          onClick={load}
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
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Party</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
              <td className="p-3 text-black">
                {new Date(r.payment_date).toLocaleDateString()}
              </td>
                <td className="p-3 text-black">
                  {r.type}
                </td>
                <td className="p-3 text-black">
                  {r.party_name || "—"}
                </td>
                <td className="p-3 text-black">
                  {r.payment_method}
                </td>
                <td
                  className={`p-3 text-right font-semibold ${
                    r.type === "CUSTOMER"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Number(r.amount).toLocaleString()}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center text-gray-500"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
