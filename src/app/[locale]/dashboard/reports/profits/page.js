"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";

export default function ProfitReport() {
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const t = useTranslations("");

  async function load() {
    if (!month) return;

    const res = await fetch(`/api/reports/profits?month=${month}`);
    const json = await res.json();
    setData(json);
  }

  function downloadPDF() {
    if (!data) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(t("profit_report"), 14, 20);

    // Month
    doc.setFontSize(11);
    doc.text(`${t("month")}: ${month}`, 14, 30);

    // Divider
    doc.line(14, 34, 196, 34);

    // Summary
    doc.setFontSize(12);
    doc.text(`${t("total_sales")}:`, 14, 45);
    doc.text(
      data.totalSales.toLocaleString(),
      120,
      45,
      { align: "right" }
    );

    doc.text(`${t("total_purchases")}:`, 14, 55);
    doc.text(
      data.totalPurchases.toLocaleString(),
      120,
      55,
      { align: "right" }
    );

    doc.text(`${t("net_profit")}:`, 14, 65);
    doc.text(
      data.profit.toLocaleString(),
      120,
      65,
      { align: "right" }
    );

    doc.save(`profit-report-${month}.pdf`);
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-6 text-gray-900">
      <h1 className="text-2xl font-bold text-black">
        {t("profit_report")}
      </h1>

      {/* Filters + Actions */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">
              {t("month")}
            </label>
            <input
              type="month"
              className="border p-2 rounded text-black"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <button
            onClick={load}
            className="bg-red-700 text-white px-4 py-2 rounded h-10"
          >
            {t("view")}
          </button>
        </div>

        {/* DOWNLOAD PDF */}
        <button
          onClick={downloadPDF}
          disabled={!data}
          className="
            bg-gray-900 text-white px-4 py-2 rounded h-10
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">
              {t("total_sales")}
            </p>
            <p className="text-xl font-bold text-black">
              {data.totalSales.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">
              {t("total_purchases")}
            </p>
            <p className="text-xl font-bold text-black">
              {data.totalPurchases.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500 text-sm">
              {t("net_profit")}
            </p>
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
