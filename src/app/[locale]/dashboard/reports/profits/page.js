"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import jsPDF from "jspdf";

export default function ProfitReport() {
  const t = useTranslations("");
  const [month, setMonth] = useState("");
  const [productId, setProductId] = useState(""); // "" = all products
  const [productsList, setProductsList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all products once
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(setProductsList)
      .catch(() => console.error("Failed to load products"));
  }, []);

  async function loadReport() {
    if (!month) return;
    setLoading(true);
    try {
      const url = `/api/reports/profits?month=${month}${productId ? `&product_id=${productId}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load report");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      alert("Error loading report");
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF() {
    if (!data) return;

    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.text(t("profit_report"), 14, y);
    y += 10;

    // Month & Filter
    doc.setFontSize(11);
    doc.text(`${t("month")}: ${data.month || month}`, 14, y);
    y += 7;
    if (productId && data.products.length > 0) {
      doc.text(`${t("product")}: ${data.products[0].product_name}`, 14, y);
      y += 7;
    }
    doc.line(14, y, 196, y);
    y += 10;

    // Summary
    doc.setFontSize(12);
    doc.text(t("total_sales"), 14, y);
    doc.text(data.summary.totalSales.toLocaleString(), 180, y, { align: "right" });
    y += 8;

    doc.text(t("cost_of_goods_sold"), 14, y);
    doc.text(data.summary.totalCOGS.toLocaleString(), 180, y, { align: "right" });
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text(t("gross_profit"), 14, y);
    doc.text(data.summary.grossProfit.toLocaleString(), 180, y, { align: "right" });
    y += 10;

    // Product table
    if (data.products.length > 0) {
      y += 5;
      doc.setFontSize(13);
      doc.text(t("product_performance"), 14, y);
      y += 8;

      doc.setFontSize(10);
      // Headers
      doc.text(t("product"), 14, y);
      doc.text(t("units_sold"), 80, y);
      doc.text(t("revenue"), 110, y);
      doc.text(t("cogs"), 140, y);
      doc.text(t("profit"), 170, y);
      y += 6;
      doc.line(14, y - 2, 196, y - 2);

      data.products.forEach(p => {
        y += 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(p.product_name.substring(0, 30), 14, y); // truncate long names
        doc.text(Number(p.units_sold).toLocaleString(), 80, y, { align: "right" });
        doc.text(p.revenue.toLocaleString(), 110, y, { align: "right" });
        doc.text(p.cost_of_goods.toLocaleString(), 140, y, { align: "right" });
        doc.text(p.gross_profit.toLocaleString(), 170, y, { align: "right" });
      });
    }

    doc.save(`profit-report-${month}${productId ? "-product" : ""}.pdf`);
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-6 text-gray-900">
      <h1 className="text-2xl font-bold text-black">{t("profit_report")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">{t("month")}</label>
          <input
            type="month"
            className="border p-2 rounded text-black"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-black">{t("product")}</label>
          <select
            className="border p-2 rounded text-black min-w-[200px]"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">{t("all_products")}</option>
            {productsList.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadReport}
          disabled={loading || !month}
          className="bg-red-700 text-white px-6 py-2 rounded h-10 disabled:opacity-50"
        >
          {loading ? t("loading") : t("view")}
        </button>

        <button
          onClick={downloadPDF}
          disabled={!data || loading}
          className="bg-gray-900 text-white px-6 py-2 rounded h-10 disabled:opacity-50"
        >
          ⬇ {t("download_pdf")}
        </button>
      </div>

      {/* Summary */}
      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">{t("total_sales")}</p>
              <p className="text-2xl font-bold">{data.summary.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">{t("cost_of_goods_sold")}</p>
              <p className="text-2xl font-bold">{data.summary.totalCOGS.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">{t("gross_profit")}</p>
              <p className={`text-2xl font-bold ${data.summary.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data.summary.grossProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Product Table */}
          {data.products.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                {productId ? t("product_detail") : t("products_performance")}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left">{t("product")}</th>
                      <th className="border p-3 text-right">{t("units_sold")}</th>
                      <th className="border p-3 text-right">{t("revenue")}</th>
                      <th className="border p-3 text-right">{t("cogs")}</th>
                      <th className="border p-3 text-right">{t("gross_profit")}</th>
                      <th className="border p-3 text-right">{t("margin")} %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map(p => (
                      <tr key={p.product_id} className="hover:bg-gray-50">
                        <td className="border p-3">{p.product_name}</td>
                        <td className="border p-3 text-right">{Number(p.units_sold).toLocaleString()}</td>
                        <td className="border p-3 text-right">{p.revenue.toLocaleString()}</td>
                        <td className="border p-3 text-right">{p.cost_of_goods.toLocaleString()}</td>
                        <td className="border p-3 text-right font-medium">
                          {p.gross_profit >= 0 ? "+" : ""}{p.gross_profit.toLocaleString()}
                        </td>
                        <td className="border p-3 text-right">
                          {p.profit_margin_percent !== null ? `${p.profit_margin_percent}%` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.products.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              {t("no_data_for_this_period")}
            </p>
          )}
        </>
      )}
    </div>
  );
}