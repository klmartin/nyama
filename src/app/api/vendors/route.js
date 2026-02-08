import { NextResponse } from "next/server";
import {db} from "@/lib/db";

/* GET all vendors (with search) */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const [rows] = await db.query(
    `SELECT * FROM vendors 
     WHERE name LIKE ? OR phone LIKE ?
     ORDER BY id DESC`,
    [`%${search}%`, `%${search}%`]
  );

  return NextResponse.json(rows);
}

/* ADD vendor */
export async function POST(req) {
  const body = await req.json();
  const { name, phone, address, email } = body;

  if (!name || !phone) {
    return NextResponse.json(
      { message: "Name and phone required" },
      { status: 400 }
    );
  }

  await db.query(
    `INSERT INTO vendors (name, phone, address, email)
     VALUES (?, ?, ?, ?)`,
    [name, phone, address, email]
  );

  return NextResponse.json({ success: true });
}

/* UPDATE vendor */
export async function PUT(req) {
  const body = await req.json();
  const { id, name, phone, address, email } = body;

  await db.query(
    `UPDATE vendors 
     SET name=?, phone=?, address=?, email=? 
     WHERE id=?`,
    [name, phone, address, email, id]
  );

  return NextResponse.json({ success: true });
}

/* DELETE vendor */
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  await db.query(`DELETE FROM vendors WHERE id=?`, [id]);

  return NextResponse.json({ success: true });
}
