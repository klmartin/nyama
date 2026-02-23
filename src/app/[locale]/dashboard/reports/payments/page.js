"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PaymentsReport() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ incoming: 0, outgoing: 0, net: 0 });
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [partyId, setPartyId] = useState("");
  const [productId, setProductId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const t = useTranslations("");

  // Load data
  useEffect(() => {
    fetch("/api/customers")
      .then(r => r.json())
      .then(setCustomers);

    fetch("/api/vendors")
      .then(r => r.json())
      .then(setVendors);

    fetch("/api/products")
      .then(r => r.json())
      .then(setProducts);
  }, []);

  async function load() {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (partyId) params.append("party_id", partyId);
    if (productId) params.append("product_id", productId);

    const res = await fetch(`/api/reports/payments?${params}`);
    const json = await res.json();
    setRows(json.rows);
    setTotals(json.totals);
  }

  function downloadPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(t("payments_report"), 14, 15);

    doc.setFontSize(10);
    let y = 22;
    doc.text(`${t("from")}: ${from || "-"}`, 14, y);
    doc.text(`${t("to")}: ${to || "-"}`, 80, y);
    y += 7;
    doc.text(`${t("type")}: ${type || t("all")}`, 14, y);
    y += 7;

    if (partyId) {
      const list = type === "CUSTOMER" ? customers : vendors;
      const party = list.find(p => p.id == partyId);
      doc.text(
        `${t(type === "CUSTOMER" ? "customer" : "vendor")}: ${party?.name || partyId}`,
        14,
        y
      );
      y += 7;
    }

    if (productId) {
      const prod = products.find(p => p.id == productId);
      doc.text(`${t("product")}: ${prod?.name || productId}`, 14, y);
    }

    autoTable(doc, {
      startY: y + 10,
      head: [[
        t("date"),
        t("party"),
        t("product"),
        t("amount"),
        t("notes"),
      ]],
      body: rows.map(r => [
        new Date(r.payment_date).toLocaleDateString(),
        r.party_name || "—",
        r.product_name || "—",
        Number(r.amount).toLocaleString(),
        r.notes || "—",
      ]),
    });

    y = doc.lastAutoTable.finalY + 10;
    doc.text(`${t("total_incoming")}: ${totals.incoming.toLocaleString()}`, 14, y);
    y += 7;
    doc.text(`${t("total_outgoing")}: ${totals.outgoing.toLocaleString()}`, 14, y);
    y += 7;
    doc.text(`${t("net")}: ${totals.net.toLocaleString()}`, 14, y);

    doc.save("payments-report.pdf");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        {t("payments_report")}
      </h1>

      {/* Filters - all perfectly aligned */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-black">
            {t("type")}
          </label>
          <select
            className="border border-gray-300 p-2.5 rounded text-black h-10 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-red-500"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPartyId(""); // reset party when type changes
            }}
          >
            <option value="">{t("all")}</option>
            <option value="CUSTOMER">{t("customer_payments")}</option>
            <option value="VENDOR">{t("vendor_payments")}</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-black">
            {t("from")}
          </label>
          <input
            type="date"
            className="border border-gray-300 p-2.5 rounded text-black h-10 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-black">
            {t("to")}
          </label>
          <input
            type="date"
            className="border border-gray-300 p-2.5 rounded text-black h-10 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-black">
            {t(type === "CUSTOMER" ? "customer" : type === "VENDOR" ? "vendor" : "party")}
          </label>
          <select
            className="border border-gray-300 p-2.5 rounded text-black h-10 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-red-500"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            disabled={!type} // disable if no type selected
          >
            <option value="">{t("all")}</option>
            {(type === "CUSTOMER" ? customers : vendors).map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1 text-black">
            {t("product")}
          </label>
          <select
            className="border border-gray-300 p-2.5 rounded text-black h-10 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-red-500"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">{t("all_products")}</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={load}
          className="bg-red-700 text-white px-6 py-2.5 rounded h-10 font-medium"
        >
          {t("filter")}
        </button>

        <button
          onClick={downloadPDF}
          disabled={!rows.length}
          className="bg-gray-900 text-white px-6 py-2.5 rounded h-10 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow text-gray-900 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="p-3 text-left">{t("date")}</th>
              <th className="p-3 text-left">{t("party")}</th>
              <th className="p-3 text-left">{t("product")}</th>
              <th className="p-3 text-left">{t("amount")}</th>
              <th className="p-3 text-left">{t("notes")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-left">
                  {new Date(r.payment_date).toLocaleDateString()}
                </td>
                <td className="p-3 text-left font-medium">
                  {r.party_name || "—"}
                </td>
                <td className="p-3 text-left">
                  {r.product_name || "—"}
                </td>
                <td
                  className={`p-3 text-left font-semibold ${
                    r.type === "CUSTOMER" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Number(r.amount).toLocaleString()}
                </td>
                <td className="p-3 text-left">
                  {r.notes || "—"}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  {t("no_payments_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="space-y-1 text-right font-bold text-lg mt-4">
          <div>{t("total_incoming")}: {totals.incoming.toLocaleString()}</div>
          <div>{t("total_outgoing")}: {totals.outgoing.toLocaleString()}</div>
          <div>{t("net")}: {totals.net.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}