"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const t = useTranslations("");

  async function load() {
    const res = await fetch(
      `/api/reports/sales?from=${from}&to=${to}`
    );
    const json = await res.json();
    setData(json.rows);
    setTotal(json.total);
  }

  function downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(t("sales_report"), 14, 15);

    doc.setFontSize(10);
    doc.text(`${t("from")}: ${from || "-"}`, 14, 22);
    doc.text(`${t("to")}: ${to || "-"}`, 80, 22);

    autoTable(doc, {
      startY: 28,
      head: [[t("customer"), t("amount"), t("date")]],
      body: data.map((r) => [
        r.customer,
        Number(r.total_amount).toLocaleString(),
        new Date(r.created_at).toLocaleDateString(),
      ]),
    });

    doc.text(
      `${t("total")}: ${Number(total).toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("sales-report.pdf");
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-4 text-gray-900">
      <h2 className="text-xl font-bold">{t("sales_report")}</h2>

      {/* Filters + Actions */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">
              {t("from")}
            </label>
            <input
              type="date"
              className="border p-2 rounded text-black"
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-black">
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

        {/* DOWNLOAD BUTTON */}
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
      <table className="w-full mt-4 border">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            <th className="p-2 text-left">{t("customer")}</th>
            <th className="p-2 text-right">{t("amount")}</th>
            <th className="p-2 text-left">{t("date")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.customer}</td>
              <td className="p-2 text-right font-semibold">
                {Number(r.total_amount).toLocaleString()}
              </td>
              <td className="p-2">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold text-lg">
        {t("total")}: {Number(total).toLocaleString()}
      </div>
    </div>
  );
}
