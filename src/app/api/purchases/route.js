import { NextResponse } from "next/server";
import {db} from "@/lib/db";

// GET purchases
// export async function GET() {
//   const [rows] = await db.query(`
//     SELECT p.*, v.name AS vendor, pr.name AS product
//     FROM purchases p
//     JOIN vendors v ON p.vendor_id = v.id
//     JOIN products pr ON p.product_id = pr.id
//     ORDER BY p.purchase_date DESC
//   `);
//   return NextResponse.json(rows);
// }

// /api/purchases/route.js (GET) - add this to your existing POST handler or separate file

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const vendor_id = searchParams.get('vendor_id');
  const status = searchParams.get('status'); // e.g., 'OPEN'

  try {
    let query = `
      SELECT 
        p.id,
        p.vendor_id,
        v.name AS vendor_name,
        p.product_id,
        pr.name AS product_name,
        p.quantity,
        p.price_per_unit,
        p.total_cost,
        p.paid_amount,
        p.payment_status,
        p.purchase_date
      FROM purchases p
      LEFT JOIN vendors v ON v.id = p.vendor_id
      LEFT JOIN products pr ON pr.id = p.product_id
    `;

    const params = [];

    let whereClauses = [];

    if (vendor_id) {
      whereClauses.push('p.vendor_id = ?');
      params.push(vendor_id);
    }

    if (status === 'OPEN') {
      whereClauses.push('(p.payment_status = "UNPAID" OR p.payment_status = "PARTIAL")');
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY p.purchase_date DESC';

    const connection = await db.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch purchases failed:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req) {
  const connection = await db.getConnection();

  try {
    const body = await req.json();

    const {
      vendor_id,
      product_id,
      quantity,
      purchase_date,
      payment_status = "UNPAID",
      amount_paid = 0,
    } = body;

    // Basic validation
    if (!vendor_id || !product_id || !quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { error: "vendor_id, product_id and quantity > 0 are required" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // 1. Get product info
    const [productRows] = await connection.query(
      "SELECT buying_price, stock_quantity FROM products WHERE id = ?",
      [product_id]
    );

    if (productRows.length === 0) {
      throw new Error("Product not found");
    }

    const buying_price = Number(productRows[0].buying_price);
    const current_stock = Number(productRows[0].stock_quantity || 0);

    if (isNaN(buying_price)) {
      throw new Error("Invalid buying price in database");
    }

    const qty = Number(quantity);
    const total_cost = qty * buying_price;

    // 2. Insert purchase
    const [purchaseResult] = await connection.query(
      `INSERT INTO purchases 
       (vendor_id, product_id, quantity, price_per_unit, total_cost, purchase_date, payment_status, paid_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        vendor_id,
        product_id,
        qty,
        buying_price,
        total_cost,
        purchase_date || new Date().toISOString().slice(0, 10),
        payment_status,
        payment_status === "PAID" 
          ? total_cost 
          : (payment_status === "PARTIAL" ? Number(amount_paid) : 0),
      ]
    );

    const purchaseId = purchaseResult.insertId;

    // 3. Update stock
    const newStock = current_stock + qty;
    await connection.query(
      "UPDATE products SET stock_quantity = ? WHERE id = ?",
      [newStock, product_id]
    );

    // 4. Record payment if applicable
    if (payment_status === "PAID" || (payment_status === "PARTIAL" && Number(amount_paid) > 0)) {
      const paidAmount = payment_status === "PAID" ? total_cost : Number(amount_paid);

      await connection.query(
        `INSERT INTO payments 
        (type, reference_id, amount, payment_method, payment_date, created_at)
        VALUES ('VENDOR', ?, ?, 'CASH', ?, NOW())`,
        [purchaseId, paidAmount, purchase_date || new Date().toISOString().slice(0, 10)]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      purchase_id: purchaseId,
      total_cost,
      paid: payment_status === "PAID" ? total_cost : (payment_status === "PARTIAL" ? Number(amount_paid) : 0),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Purchase creation failed:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create purchase" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}