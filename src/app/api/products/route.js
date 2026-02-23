import { NextResponse } from "next/server";
import {db} from "@/lib/db";


export async function GET(req) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams);

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.unit,
        p.stock_quantity,
        p.buying_price,
        p.selling_price,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(SUM(si.quantity), 0) AS total_sold_units,
        COALESCE(SUM(si.quantity * si.price_per_unit), 0) AS total_sales_value
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

    // Optional: format numbers in backend if you prefer (or do it in frontend)
    const formatted = rows.map(row => ({
      ...row,
      stock_quantity: Number(row.stock_quantity || 0),
      buying_price: Number(row.buying_price || 0),
      selling_price: Number(row.selling_price || 0),
      total_sold_units: Number(row.total_sold_units || 0),
      total_sales_value: Number(row.total_sales_value || 0),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching products:", error);
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
    const { name, unit, buying_price, selling_price } = body;

    if (!name ||   !unit || !buying_price || !selling_price)
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );

    await db.query(
      `INSERT INTO products (name,  unit, buying_price, selling_price)
       VALUES (?, ?, ?, ?)`,
      [name, unit, buying_price, selling_price]
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
    const { id, name, unit, buying_price, selling_price, is_active } = body;

    if (!id || !name  || !unit || !buying_price || !selling_price)
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );

    await db.query(
      `UPDATE products 
       SET name=?,  unit=?, buying_price=?, selling_price=?, is_active=? 
       WHERE id=?`,
      [name, unit, buying_price, selling_price, is_active ? 1 : 0, id]
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
