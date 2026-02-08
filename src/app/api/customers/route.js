import { NextResponse } from "next/server";
import {db} from "@/lib/db";

// GET customers with optional search
export async function GET(req) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams);

    let sql = "SELECT * FROM customers";
    const params = [];

    if (search) {
      sql += " WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await db.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch customers" }, { status: 500 });
  }
}

// CREATE customer
export async function POST(req) {
  try {
    const { name, phone, address, email, balance } = await req.json();

    if (!name || !phone)
      return NextResponse.json({ message: "Name & phone are required" }, { status: 400 });

    await db.query(
      `INSERT INTO customers (name, phone, address, email, balance) VALUES (?, ?, ?, ?, ?)`,
      [name, phone, address || "", email || "", balance || 0]
    );

    return NextResponse.json({ message: "Customer created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create customer" }, { status: 500 });
  }
}

// UPDATE customer
export async function PUT(req) {
  try {
    const { id, name, phone, address, email, balance, is_active } = await req.json();

    if (!id || !name || !phone)
      return NextResponse.json({ message: "ID, Name & Phone are required" }, { status: 400 });

    await db.query(
      `UPDATE customers SET name=?, phone=?, address=?, email=?, balance=?, is_active=? WHERE id=?`,
      [name, phone, address || "", email || "", balance || 0, is_active ? 1 : 0, id]
    );

    return NextResponse.json({ message: "Customer updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ message: "Customer id required" }, { status: 400 });

    await db.query(`DELETE FROM customers WHERE id=?`, [id]);

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to delete customer" }, { status: 500 });
  }
}
