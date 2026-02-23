// /api/reports/profits/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");           // e.g. "2025-02"
  const productId = searchParams.get("product_id");  // optional filter

  if (!month) {
    return NextResponse.json({ error: "Month is required (YYYY-MM)" }, { status: 400 });
  }

  const connection = await db.getConnection();

  try {
    // 1. Overall totals for the month
    const [[salesTotal]] = await connection.query(
      `
      SELECT 
        COALESCE(SUM(si.quantity * si.price_per_unit), 0) AS total_sales
      FROM sales s
      JOIN sale_items si ON si.sale_id = s.id
      WHERE DATE_FORMAT(s.sale_date, '%Y-%m') = ?
      `,
      [month]
    );

    const [[cogsTotal]] = await connection.query(
      `
      SELECT 
        COALESCE(SUM(si.quantity * p.buying_price), 0) AS total_cogs
      FROM sales s
      JOIN sale_items si ON si.sale_id = s.id
      JOIN products p ON p.id = si.product_id
      WHERE DATE_FORMAT(s.sale_date, '%Y-%m') = ?
      `,
      [month]
    );

    const totalSales = Number(salesTotal.total_sales || 0);
    const totalCOGS   = Number(cogsTotal.total_cogs || 0);
    const grossProfit = totalSales - totalCOGS;

    // 2. Per-product breakdown
    let productQuery = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        SUM(si.quantity) AS units_sold,
        SUM(si.quantity * si.price_per_unit) AS revenue,
        SUM(si.quantity * p.buying_price) AS cost_of_goods,
        SUM(si.quantity * si.price_per_unit) - SUM(si.quantity * p.buying_price) AS gross_profit,
        CASE 
          WHEN SUM(si.quantity * p.buying_price) = 0 THEN NULL
          ELSE ROUND(
            (SUM(si.quantity * si.price_per_unit) - SUM(si.quantity * p.buying_price)) / 
            SUM(si.quantity * p.buying_price) * 100, 
            2
          )
        END AS profit_margin_percent
      FROM sales s
      JOIN sale_items si ON si.sale_id = s.id
      JOIN products p ON p.id = si.product_id
      WHERE DATE_FORMAT(s.sale_date, '%Y-%m') = ?
    `;

    const queryParams = [month];

    if (productId) {
      productQuery += " AND p.id = ?";
      queryParams.push(productId);
    }

    productQuery += `
      GROUP BY p.id, p.name
      HAVING units_sold > 0
      ORDER BY gross_profit DESC
    `;

    const [productsData] = await connection.query(productQuery, queryParams);

    // Format numbers safely
    const formattedProducts = productsData.map(p => ({
      ...p,
      revenue: Number(p.revenue || 0),
      cost_of_goods: Number(p.cost_of_goods || 0),
      gross_profit: Number(p.gross_profit || 0),
      profit_margin_percent: p.profit_margin_percent !== null ? Number(p.profit_margin_percent) : null,
    }));

    return NextResponse.json({
      month,
      summary: {
        totalSales,
        totalCOGS,
        grossProfit,
        profitMarginPercent: totalCOGS > 0 ? Number(((grossProfit / totalCOGS) * 100).toFixed(2)) : null,
      },
      products: formattedProducts,
      totalProductsSold: formattedProducts.reduce((sum, p) => sum + Number(p.units_sold || 0), 0),
    });
  } catch (error) {
    console.error("Profit report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  } finally {
    connection.release();
  }
}