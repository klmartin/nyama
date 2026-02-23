import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from       = searchParams.get("from");
    const to         = searchParams.get("to");
    const vendor_id  = searchParams.get("vendor_id");   // new
    const product_id = searchParams.get("product_id");  // new

    if (!from || !to) {
      return NextResponse.json(
        { message: "From and To dates are required" },
        { status: 400 }
      );
    }

    let query = `
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
    `;

    const params = [from, to];

    if (vendor_id) {
      query += " AND p.vendor_id = ?";
      params.push(vendor_id);
    }

    if (product_id) {
      query += " AND p.product_id = ?";
      params.push(product_id);
    }

    query += " ORDER BY p.purchase_date DESC";

    const [rows] = await db.query(query, params);

    // Calculate total
    const total = rows.reduce((sum, r) => sum + Number(r.total_cost || 0), 0);

    return NextResponse.json({
      rows,
      total,
    });
  } catch (error) {
    console.error("Purchases report error:", error);
    return NextResponse.json(
      { message: "Failed to load purchases report" },
      { status: 500 }
    );
  }
}