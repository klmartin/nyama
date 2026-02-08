import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let where = "WHERE 1=1";
    const params = [];

    if (from) {
      where += " AND s.sale_date >= ?";
      params.push(from);
    }

    if (to) {
      where += " AND s.sale_date <= ?";
      params.push(to);
    }

    // Fetch rows
    const [rows] = await db.query(
      `
      SELECT
        s.id,
        c.name AS customer,
        s.total_amount,
        s.created_at
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      ${where}
      ORDER BY s.created_at DESC
      `,
      params
    );

    // Fetch total
    const [[totalRow]] = await db.query(
      `
      SELECT COALESCE(SUM(s.total_amount),0) AS total
      FROM sales s
      ${where}
      `,
      params
    );

    return NextResponse.json({
      rows,
      total: totalRow.total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to load sales report" },
      { status: 500 }
    );
  }
}
