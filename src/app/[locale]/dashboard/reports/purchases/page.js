"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PurchasesReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vendorId, setVendorId] = useState("");     // new
  const [productId, setProductId] = useState("");   // new
  const [vendors, setVendors] = useState([]);       // new
  const [products, setProducts] = useState([]);     // new
  const t = useTranslations("");

  // Load vendors and products once
  useEffect(() => {
    fetch("/api/vendors")
      .then(r => r.json())
      .then(setVendors)
      .catch(console.error);

    fetch("/api/products")
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  async function load() {
    if (!from || !to) return;

    const url = `/api/reports/purchases?from=${from}&to=${to}` +
      (vendorId ? `&vendor_id=${vendorId}` : "") +
      (productId ? `&product_id=${productId}` : "");

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Report fetch failed:", res.status);
      return;
    }

    const json = await res.json();
    setData(json.rows);
    setTotal(json.total);
  }

  function downloadPDF() {
    if (!data.length) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(t("purchases_report"), 14, 15);

    // Date range & filters
    doc.setFontSize(10);
    let y = 22;
    doc.text(`${t("from")}: ${from || "-"}`, 14, y);
    doc.text(`${t("to")}: ${to || "-"}`, 80, y);
    y += 7;
    if (vendorId) {
      const vendor = vendors.find(v => v.id == vendorId);
      doc.text(`${t("supplier")}: ${vendor?.name || vendorId}`, 14, y);
      y += 7;
    }
    if (productId) {
      const product = products.find(p => p.id == productId);
      doc.text(`${t("product")}: ${product?.name || productId}`, 14, y);
      y += 7;
    }

    // Table
    autoTable(doc, {
      startY: y + 5,
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
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              {t("from")}
            </label>
            <input
              type="date"
              className="border p-2 rounded text-black"
              value={from}
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
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              {t("supplier")}
            </label>
            <select
              className="border p-2 rounded text-black min-w-[180px]"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">{t("all_suppliers")}</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              {t("product")}
            </label>
            <select
              className="border p-2 rounded text-black min-w-[180px]"
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

      {data.length > 0 && (
        <div className="text-right font-bold text-black text-lg">
          {t("total_purchases_amount")}: {Number(total).toLocaleString()}
        </div>
      )}
    </div>
  );
}