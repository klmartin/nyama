"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PurchasesReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const t = useTranslations("");

  async function load() {
    const res = await fetch(
      `/api/reports/purchases?from=${from}&to=${to}`
    );
    const json = await res.json();
    setData(json.rows);
    setTotal(json.total);
  }

  function downloadPDF() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(t("purchases_report"), 14, 15);

    // Date range
    doc.setFontSize(10);
    doc.text(`${t("from")}: ${from || "-"}`, 14, 22);
    doc.text(`${t("to")}: ${to || "-"}`, 80, 22);

    // Table
    autoTable(doc, {
      startY: 28,
      head: [[
        t("supplier"),
        t("product"),
        t("quantity"),
        t("amount"),
        t("date"),
      ]],
      body: data.map((r) => [
        r.vendor,
        r.product,
        r.quantity,
        Number(r.total_cost).toLocaleString(),
        new Date(r.purchase_date).toLocaleDateString(),
      ]),
    });

    // Total
    doc.text(
      `${t("total_purchases_amount")}: ${Number(total).toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("purchases-report.pdf");
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-4 text-gray-900">
      <h1 className="text-2xl font-bold text-black">
        {t("purchases_report")}
      </h1>

      {/* Filters + Actions */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              {t("from")}
            </label>
            <input
              type="date"
              className="border p-2 rounded text-black"
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              {t("to")}
            </label>
            <input
              type="date"
              className="border p-2 rounded text-black"
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            onClick={load}
            className="bg-red-700 text-white px-4 py-2 rounded h-10"
          >
            {t("generate")}
          </button>
        </div>

        {/* DOWNLOAD PDF */}
        <button
          onClick={downloadPDF}
          disabled={!data.length}
          className="
            bg-gray-900 text-white px-4 py-2 rounded h-10
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">{t("supplier")}</th>
              <th className="p-3 text-left">{t("product")}</th>
              <th className="p-3 text-left">{t("quantity")}</th>
              <th className="p-3 text-right">{t("amount")}</th>
              <th className="p-3 text-left">{t("date")}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3">{row.vendor}</td>
                <td className="p-3">{row.product}</td>
                <td className="p-3">{row.quantity}</td>
                <td className="p-3 text-right font-semibold">
                  {Number(row.total_cost).toLocaleString()}
                </td>
                <td className="p-3">
                  {new Date(row.purchase_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right font-bold text-black text-lg">
        {t("total_purchases_amount")}:{" "}
        {Number(total).toLocaleString()}
      </div>
    </div>
  );
}
