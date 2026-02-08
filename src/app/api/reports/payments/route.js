import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type"); // CUSTOMER | VENDOR
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let sql = `
      SELECT
        p.id,
        p.type,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.notes,
        p.created_at,

        CASE
          WHEN p.type = 'CUSTOMER' THEN c.name
          WHEN p.type = 'VENDOR' THEN v.name
        END AS party_name

      FROM payments p
      LEFT JOIN customers c 
        ON p.type = 'CUSTOMER' AND p.reference_id = c.id
      LEFT JOIN vendors v 
        ON p.type = 'VENDOR' AND p.reference_id = v.id
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

    sql += " ORDER BY p.payment_date DESC";

    const [rows] = await db.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Payments report error:", error);
    return NextResponse.json(
      { error: "Failed to load payments report" },
      { status: 500 }
    );
  }
}
