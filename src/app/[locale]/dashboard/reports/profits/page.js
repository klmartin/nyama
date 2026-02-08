"use client";
import { useState } from "react";

export default function ProfitReport() {
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);

  async function load() {
    if (!month) return;

    const res = await fetch(`/api/reports/profits?month=${month}`);
    const json = await res.json();
    setData(json);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">Profit Report</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="month"
          className="border p-2 rounded text-black"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button
          onClick={load}
          className="bg-red-700 text-white px-4 rounded"
        >
          View
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Total Sales</p>
            <p className="text-xl font-bold text-black">
              {data.totalSales.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Total Purchases</p>
            <p className="text-xl font-bold text-black">
              {data.totalPurchases.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">Net Profit</p>
            <p
              className={`text-xl font-bold ${
                data.profit >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data.profit.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
