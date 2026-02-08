import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { message: "From and To dates are required" },
        { status: 400 }
      );
    }

    // 🔹 Fetch purchase rows
    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.purchase_date,
        v.name AS vendor,
        pr.name AS product,
        p.quantity,
        p.price_per_unit,
        p.total_cost,
        p.payment_status
      FROM purchases p
      JOIN vendors v ON v.id = p.vendor_id
      JOIN products pr ON pr.id = p.product_id
      WHERE p.purchase_date BETWEEN ? AND ?
      ORDER BY p.purchase_date DESC
      `,
      [from, to]
    );

    // 🔹 Calculate total amount
    const total = rows.reduce(
      (sum, r) => sum + Number(r.total_cost),
      0
    );

    return NextResponse.json({
      rows,
      total
    });
  } catch (error) {
    console.error("Purchases report error:", error);
    return NextResponse.json(
      { message: "Failed to load purchases report" },
      { status: 500 }
    );
  }
}
