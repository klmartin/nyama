"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExpenseCategorySelect from "@/app/components/expenseCategorySelect";
export default function ExpensesReport() {
  const t = useTranslations("");

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

    setExpenses(data.expenses || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(t("expenses_report"), 14, 15);

    doc.setFontSize(10);
    doc.text(`${t("from")}: ${from || "-"}`, 14, 22);
    doc.text(`${t("to")}: ${to || "-"}`, 80, 22);

    autoTable(doc, {
      startY: 28,
      head: [[
        t("date"),
        t("title"),
        t("category"),
        t("amount"),
        t("notes"),
      ]],
      body: expenses.map((e) => [
        new Date(e.expense_date).toLocaleDateString(),
        e.title,
        e.category,
        Number(e.amount).toLocaleString(),
        e.notes || "-",
      ]),
    });

    doc.text(
      `${t("total_expenses")}: ${Number(total).toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("expenses-report.pdf");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">
        {t("expenses_report")}
      </h1>

      {/* Summary */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-sm text-gray-500">{t("total_expenses")}</p>
        <p className="text-2xl font-bold text-red-600">
          {Number(total).toLocaleString()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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

        {/* <input
          type="text"
          placeholder={t("category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded text-black"
        /> */}

        <ExpenseCategorySelect 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          includeAllOption={true}
          className="border p-2 rounded text-black"
        />

        <button
          onClick={fetchExpenses}
          className="bg-red-700 text-white px-4 rounded h-10"
        >
          {t("filter")}
        </button>

        {/* DOWNLOAD PDF */}
        <button
          onClick={downloadPDF}
          disabled={expenses.length === 0}
          className="
            bg-gray-900 text-white px-4 py-2 rounded h-10
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("title")}</th>
              <th className="p-3 text-left">{t("category")}</th>
              <th className="p-3 text-right">{t("amount")}</th>
              <th className="p-3 text-left">{t("notes")}</th>
            </tr>
          </thead>

          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  {t("no_expenses_found")}
                </td>
              </tr>
            )}

            {expenses.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3 text-black">{new Date(e.expense_date).toLocaleDateString()}</td>
                <td className="p-3 text-black">{e.title}</td>
                <td className="p-3 text-black">{e.category}</td>
                <td className="p-3 text-right text-red-600">
                  {Number(e.amount).toLocaleString()}
                </td>
                <td className="p-3 text-black">{e.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
