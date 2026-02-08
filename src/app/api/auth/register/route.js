import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function POST(req) {
  const { name, username, password } = await req.json();

  if (!name || !username || !password) {
    return Response.json({ message: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.execute(
      "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
      [name, username, hashedPassword]
    );

    return Response.json({ message: "User created" }, { status: 201 });
  } catch (err) {
    return Response.json({ message: "User already exists" }, { status: 500 });
  }
}
