import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/* UPDATE USER */
export async function PUT(req, { params }) {
  const data = await req.json();

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
    await db.query(
      `
      UPDATE users SET
      name=?, username=?, email=?, phone=?, password=?, role=?, is_active=?
      WHERE id=?
      `,
      [
        data.name,
        data.username,
        data.email,
        data.phone,
        data.password,
        data.role,
        data.is_active,
        params.id,
      ]
    );
  } else {
    await db.query(
      `
      UPDATE users SET
      name=?, username=?, email=?, phone=?, role=?, is_active=?
      WHERE id=?
      `,
      [
        data.name,
        data.username,
        data.email,
        data.phone,
        data.role,
        data.is_active,
        params.id,
      ]
    );
  }

  return NextResponse.json({ success: true });
}

/* DELETE USER */
export async function DELETE(_, { params }) {
  await db.query("DELETE FROM users WHERE id=?", [params.id]);
  return NextResponse.json({ success: true });
}