"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function PaymentsReport() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
 const t = useTranslations('');

  async function load() {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await fetch(`/api/reports/payments?${params}`);
    const json = await res.json();
    setRows(json);
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
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        {t("payments_report")}
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded text-black"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">{t("all")}</option>
          <option value="CUSTOMER">{t("customer_payments")}</option>
          <option value="VENDOR">{t("vendor_payments")}</option>
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
          {t("filter")}
        </button>

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
      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("type")}</th>
              <th className="p-3 text-left">{t("party")}</th>
              <th className="p-3 text-left">{t("method")}</th>
              <th className="p-3 text-left">{t("amount")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
              <td className="p-3 text-left">
                {new Date(r.payment_date).toLocaleDateString()}
              </td>
                <td className="p-3 text-left">
                  {r.type}
                </td>
                <td className="p-3 text-left">
                  {r.party_name || "—"}
                </td>
                <td className="p-3 text-left">
                  {r.payment_method}
                </td>
                <td
                  className={`p-3 text-left font-semibold ${
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
                  {t("no_payments_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
