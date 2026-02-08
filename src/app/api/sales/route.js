import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/* =========================
   GET: List sales
   ========================= */
export async function GET() {
  const [rows] = await db.query(`
    SELECT
      s.id,
      s.sale_date,
      s.payment_status,
      c.name AS customer,
      p.name AS product,
      si.quantity,
      si.price_per_unit,
      si.subtotal AS total_amount
    FROM sales s
    JOIN customers c ON c.id = s.customer_id
    JOIN sale_items si ON si.sale_id = s.id
    JOIN products p ON p.id = si.product_id
    ORDER BY s.created_at DESC
  `);

  return NextResponse.json(rows);
}

/* =========================
   POST: Create sale
   ========================= */
export async function POST(req) {
  const body = await req.json();
  const { customer_id, sale_date, payment_status, items } = body;

  if (!customer_id || !items?.length) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  const total = items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.price_per_unit),
    0
  );

  const [sale] = await db.query(
    `INSERT INTO sales (customer_id, sale_date, payment_status, total_amount)
     VALUES (?,?,?,?)`,
    [customer_id, sale_date, payment_status, total]
  );

  const saleId = sale.insertId;

  for (const i of items) {
    await db.query(
      `INSERT INTO sale_items
       (sale_id, product_id, quantity, price_per_unit, subtotal)
       VALUES (?,?,?,?,?)`,
      [
        saleId,
        i.product_id,
        i.quantity,
        i.price_per_unit,
        i.quantity * i.price_per_unit
      ]
    );
  }

  return NextResponse.json({ success: true });
}
