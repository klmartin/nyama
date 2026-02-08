import { NextResponse } from "next/server";
import {db} from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CUSTOMER | VENDOR

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

    sql += " ORDER BY p.payment_date DESC";

    const [rows] = await db.query(sql, params);
    return NextResponse.json(rows);

  } catch (error) {
    console.error("Payments API error:", error);
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const body = await req.json();
  const {
    type,
    reference_id,
    amount,
    payment_method,
    payment_date,
    notes,
  } = body;

  if (!type || !reference_id || !amount) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  await db.query(
    `INSERT INTO payments
     (type, reference_id, amount, payment_method, payment_date, notes)
     VALUES (?,?,?,?,?,?)`,
    [
      type,
      reference_id,
      amount,
      payment_method || "CASH",
      payment_date,
      notes,
    ]
  );

  return NextResponse.json({ success: true });
}
