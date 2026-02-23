import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type")?.toUpperCase();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const product_id = searchParams.get("product_id");

    let sql = `
      SELECT
        p.id,
        p.type,
        p.reference_id,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.notes,
        p.created_at,
        CASE
          WHEN p.type = 'CUSTOMER' THEN c.name
          WHEN p.type = 'VENDOR'   THEN v.name
          ELSE 'Unknown'
        END AS party_name,
        pr.name AS product_name
      FROM payments p
      LEFT JOIN sales s ON p.type = 'CUSTOMER' AND p.reference_id = s.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN purchases pu ON p.type = 'VENDOR' AND p.reference_id = pu.id
      LEFT JOIN vendors v ON pu.vendor_id = v.id
      LEFT JOIN sale_items si ON p.type = 'CUSTOMER' AND p.reference_id = si.sale_id
      LEFT JOIN products pr ON si.product_id = pr.id
      WHERE 1=1
    `;

    const params = [];

    if (type) {
      sql += " AND p.type = ?";
      params.push(type);
    }

    if (from) {
      sql += " AND p.payment_date >= ?";
      params.push(from);
    }

    if (to) {
      sql += " AND p.payment_date <= ?";
      params.push(to);
    }

    if (product_id) {
      sql += " AND si.product_id = ?";
      params.push(product_id);
    }

    sql += " ORDER BY p.payment_date DESC";

    const [rows] = await db.query(sql, params);

    // Totals
    const incoming = rows.reduce((sum, r) => r.type === 'CUSTOMER' ? sum + Number(r.amount) : sum, 0);
    const outgoing = rows.reduce((sum, r) => r.type === 'VENDOR' ? sum + Number(r.amount) : sum, 0);
    const net = incoming - outgoing;

    return NextResponse.json({
      rows,
      totals: { incoming, outgoing, net },
    });
  } catch (error) {
    console.error("Payments report error:", error);
    return NextResponse.json(
      { error: "Failed to load payments report" },
      { status: 500 }
    );
  }
}