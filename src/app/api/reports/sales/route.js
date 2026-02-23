import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from        = searchParams.get("from");
    const to          = searchParams.get("to");
    const customer_id = searchParams.get("customer_id");
    const product_id  = searchParams.get("product_id");

    let query = `
      SELECT 
        s.id AS sale_id,
        s.sale_date,
        s.total_amount,
        s.paid_amount,
        s.payment_status,
        c.name AS customer,
        p.name AS product,
        si.quantity,
        si.price_per_unit,
        si.subtotal,
        (s.total_amount - COALESCE(s.paid_amount, 0)) AS remaining_amount
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      JOIN sale_items si ON si.sale_id = s.id
      JOIN products p ON p.id = si.product_id
      WHERE 1=1
    `;

    const params = [];

    if (from) {
      query += " AND s.sale_date >= ?";
      params.push(from);
    }

    if (to) {
      query += " AND s.sale_date <= ?";
      params.push(to);
    }

    if (customer_id) {
      query += " AND s.customer_id = ?";
      params.push(customer_id);
    }

    if (product_id) {
      query += " AND si.product_id = ?";
      params.push(product_id);
    }

    query += " ORDER BY s.sale_date DESC, si.id ASC";

    const [rows] = await db.query(query, params);

    // Calculate grand total (sum of all total_amount in result)
    const total = rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    return NextResponse.json({
      rows,
      total,
    });
  } catch (error) {
    console.error("Sales report error:", error);
    return NextResponse.json(
      { message: "Failed to load sales report" },
      { status: 500 }
    );
  }
}