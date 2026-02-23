"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const t = useTranslations("");

  // Load customers & products once
  useEffect(() => {
    fetch("/api/customers")
      .then(r => r.json())
      .then(setCustomers)
      .catch(console.error);

    fetch("/api/products")
      .then(r => r.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  async function load() {
    if (!from || !to) return;

    let url = `/api/reports/sales?from=${from}&to=${to}`;
    if (customerId) url += `&customer_id=${customerId}`;
    if (productId) url += `&product_id=${productId}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Sales report fetch failed:", res.status);
      return;
    }

    const json = await res.json();
    setData(json.rows);
    setTotal(json.total);
  }

  function downloadPDF() {
    if (!data.length) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(t("sales_report"), 14, 15);

    doc.setFontSize(10);
    let y = 22;
    doc.text(`${t("from")}: ${from || "-"}`, 14, y);
    doc.text(`${t("to")}: ${to || "-"}`, 80, y);
    y += 7;

    if (customerId) {
      const cust = customers.find(c => c.id == customerId);
      doc.text(`${t("customer")}: ${cust?.name || customerId}`, 14, y);
      y += 7;
    }

    if (productId) {
      const prod = products.find(p => p.id == productId);
      doc.text(`${t("product")}: ${prod?.name || productId}`, 14, y);
      y += 7;
    }

    autoTable(doc, {
      startY: y + 5,
      head: [[
        t("customer"),
        t("product"),
        t("quantity"),
        t("price_per_unit"),
        t("subtotal"),
        t("total_amount"),
        t("paid"),
        t("remaining"),
        t("date"),
      ]],
      body: data.map(r => [
        r.customer,
        r.product,
        r.quantity,
        Number(r.price_per_unit).toLocaleString(),
        Number(r.subtotal).toLocaleString(),
        Number(r.total_amount).toLocaleString(),
        Number(r.paid_amount || 0).toLocaleString(),
        Number(r.remaining_amount || 0).toLocaleString(),
        new Date(r.sale_date).toLocaleDateString(),
      ]),
    });

    doc.text(
      `${t("total_sales")}: ${Number(total).toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save("sales-report.pdf");
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-4 text-gray-900">
      <h2 className="text-xl font-bold">{t("sales_report")}</h2>

      {/* Filters */}
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">
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
            <label className="block text-sm font-semibold mb-1 text-black">
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
            <label className="block text-sm font-semibold mb-1 text-black">
              {t("customer")}
            </label>
            <select
              className="border p-2 rounded text-black min-w-[180px]"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">{t("all_customers")}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-black">
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

        <button
          onClick={downloadPDF}
          disabled={!data.length}
          className="bg-gray-900 text-white px-4 py-2 rounded h-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Table */}
      <table className="w-full mt-4 border">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            <th className="p-2 text-left">{t("customer")}</th>
            <th className="p-2 text-left">{t("product")}</th>
            <th className="p-2 text-left">{t("quantity")}</th>
            <th className="p-2 text-left">{t("price_per_unit")}</th>
            <th className="p-2 text-right">{t("subtotal")}</th>
            <th className="p-2 text-right">{t("total_amount")}</th>
            <th className="p-2 text-right">{t("paid")}</th>
            <th className="p-2 text-right">{t("remaining")}</th>
            <th className="p-2 text-left">{t("date")}</th>
            <th className="p-2 text-left">{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={`${r.sale_id}-${r.product}`} className="border-t">
              <td className="p-2">{r.customer}</td>
              <td className="p-2">{r.product}</td>
              <td className="p-2">{r.quantity}</td>
              <td className="p-2">{Number(r.price_per_unit).toLocaleString()}</td>
              <td className="p-2 text-right">{Number(r.subtotal).toLocaleString()}</td>
              <td className="p-2 text-right font-semibold">
                {Number(r.total_amount).toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {Number(r.paid_amount || 0).toLocaleString()}
              </td>
              <td className="p-2 text-right">
                {Number(r.remaining_amount || 0).toLocaleString()}
              </td>
              <td className="p-2">
                {new Date(r.sale_date).toLocaleDateString()}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    r.payment_status === "PAID"
                      ? "bg-green-600"
                      : r.payment_status === "PARTIAL"
                      ? "bg-yellow-600"
                      : "bg-orange-500"
                  }`}
                >
                  {r.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length > 0 && (
        <div className="text-right font-bold text-lg mt-4">
          {t("total_sales")}: {Number(total).toLocaleString()}
        </div>
      )}
    </div>
  );
}