import { NextResponse } from "next/server";
import {db} from "@/lib/db";

// GET purchases
export async function GET() {
  const [rows] = await db.query(`
    SELECT p.*, v.name AS vendor, pr.name AS product
    FROM purchases p
    JOIN vendors v ON p.vendor_id = v.id
    JOIN products pr ON p.product_id = pr.id
    ORDER BY p.purchase_date DESC
  `);
  return NextResponse.json(rows);
}

// POST purchase
export async function POST(req) {
  const body = await req.json();
  const {
    vendor_id,
    product_id,
    quantity,
    price_per_unit,
    purchase_date,
    payment_status
  } = body;

  if (!vendor_id || !product_id || !quantity || !price_per_unit) {
    return NextResponse.json(
      { error: "All fields required" },
      { status: 400 }
    );
  }

  const total_cost = quantity * price_per_unit;

  await db.query(
    `INSERT INTO purchases
     (vendor_id, product_id, quantity, price_per_unit, total_cost, purchase_date, payment_status)
     VALUES (?,?,?,?,?,?,?)`,
    [
      vendor_id,
      product_id,
      quantity,
      price_per_unit,
      total_cost,
      purchase_date,
      payment_status || "UNPAID"
    ]
  );

  return NextResponse.json({ success: true });
}
