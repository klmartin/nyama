import { NextResponse } from "next/server";
import {db} from "@/lib/db";

// GET all products with optional search
export async function GET(req) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams);

    let sql = `
      SELECT
        p.*,
        COALESCE(SUM(si.quantity), 0) AS sold_quantity,
        (p.opening_stock - COALESCE(SUM(si.quantity), 0)) AS remaining_stock
      FROM products p
      LEFT JOIN sale_items si ON si.product_id = p.id
    `;

    const params = [];

    if (search) {
      sql += " WHERE p.name LIKE ?";
      params.push(`%${search}%`);
    }

    sql += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    const [rows] = await db.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}


// CREATE product
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, opening_stock, unit, buying_price, selling_price } = body;

    if (!name || !opening_stock || !unit || !buying_price || !selling_price)
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );

    await db.query(
      `INSERT INTO products (name, opening_stock, unit, buying_price, selling_price)
       VALUES (?, ?, ?, ?, ?)`,
      [name, opening_stock, unit, buying_price, selling_price]
    );

    return NextResponse.json({ message: "Product created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, opening_stock, unit, buying_price, selling_price, is_active } = body;

    if (!id || !name || !opening_stock || !unit || !buying_price || !selling_price)
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );

    await db.query(
      `UPDATE products 
       SET name=?, opening_stock=?, unit=?, buying_price=?, selling_price=?, is_active=? 
       WHERE id=?`,
      [name, opening_stock,
         unit, buying_price, selling_price, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ message: "Product id required" }, { status: 400 });

    await db.query(`DELETE FROM products WHERE id=?`, [id]);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
