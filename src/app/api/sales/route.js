import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/* =========================
   GET: List sales
   ========================= */

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const customer_id = searchParams.get("customer_id");
  const status = searchParams.get("status"); // e.g. "OPEN"

  try {
    let query = `
      SELECT 
        s.id AS sale_id,
        s.sale_date,
        s.payment_status,
        s.paid_amount,
        s.total_amount,
        c.name AS customer,
        p.name AS product,
        si.quantity,
        si.price_per_unit,
        si.subtotal
      FROM sales s
      JOIN customers c ON c.id = s.customer_id
      JOIN sale_items si ON si.sale_id = s.id
      JOIN products p ON p.id = si.product_id
    `;

    const params = [];
    const whereClauses = [];

    if (customer_id) {
      whereClauses.push("s.customer_id = ?");
      params.push(customer_id);
    }

    if (status === "OPEN") {
      whereClauses.push('(s.payment_status = "UNPAID" OR s.payment_status = "PARTIAL")');
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    query += `
      ORDER BY s.sale_date DESC, si.id ASC
    `;

    const connection = await db.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Fetch sales failed:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req) {
  const connection = await db.getConnection();

  try {
    const body = await req.json();
    const { customer_id, sale_date, payment_status = "UNPAID", items } = body;

    if (!customer_id || !items?.length) {
      return NextResponse.json(
        { error: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // 1. Calculate total
    const total = items.reduce(
      (sum, i) => sum + Number(i.quantity) * Number(i.price_per_unit),
      0
    );

    // 2. Validate stock for all items first (prevent partial failures)
    for (const item of items) {
      const [product] = await connection.query(
        "SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      if (product.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const currentStock = Number(product[0].stock_quantity || 0);
      const requestedQty = Number(item.quantity);

      if (currentStock < requestedQty) {
        throw new Error(
          `Not enough stock for product ${item.product_id}. Available: ${currentStock}, Requested: ${requestedQty}`
        );
      }
    }

    // 3. Insert the sale
    const [saleResult] = await connection.query(
      `INSERT INTO sales (customer_id, sale_date, payment_status, total_amount, created_at)
       VALUES (?,?,?, ?, NOW())`,
      [customer_id, sale_date, payment_status, total]
    );

    const saleId = saleResult.insertId;

    // 4. Insert sale items & deduct stock
    for (const item of items) {
      const qty = Number(item.quantity);
      const price = Number(item.price_per_unit);
      const subtotal = qty * price;

      // Insert item
      await connection.query(
        `INSERT INTO sale_items
         (sale_id, product_id, quantity, price_per_unit, subtotal)
         VALUES (?,?,?,?,?)`,
        [saleId, item.product_id, qty, price, subtotal]
      );

      // Deduct from stock
      await connection.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - ?,
             updated_at = NOW()
         WHERE id = ?`,
        [qty, item.product_id]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      sale_id: saleId,
      total_amount: total,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Sale creation failed:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create sale" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}