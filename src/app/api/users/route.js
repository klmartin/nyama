import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/* GET USERS (with search) */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const [rows] = await db.query(
    `
    SELECT id, name, username, email, phone, role, is_active, created_at
    FROM users
    WHERE name LIKE ? OR username LIKE ? OR email LIKE ?
    ORDER BY created_at DESC
    `,
    [`%${q}%`, `%${q}%`, `%${q}%`]
  );

  return NextResponse.json(rows);
}

/* CREATE USER */
export async function POST(req) {
  const data = await req.json();
  const hash = await bcrypt.hash(data.password, 10);

  await db.query(
    `
    INSERT INTO users
    (name, username, email, phone, password, role, is_active)
    VALUES (?,?,?,?,?,?,?)
    `,
    [
      data.name,
      data.username,
      data.email,
      data.phone,
      hash,
      data.role,
      data.is_active ?? 1,
    ]
  );

  return NextResponse.json({ success: true });
}