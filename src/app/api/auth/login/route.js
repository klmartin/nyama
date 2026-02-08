import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const SECRET = process.env.JWT_SECRET || "secret123";

export async function POST(req) {
  const { username, password } = await req.json();

  const [rows] = await db.execute(
    "SELECT * FROM users WHERE username = ? AND is_active = 1",
    [username]
  );

  if (!rows.length) {
    return Response.json({ message: "Invalid login" }, { status: 401 });
  }

  const user = rows[0];
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ message: "Invalid login" }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  return new Response(
    JSON.stringify({ message: "Login successful" }),
    {
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        "Content-Type": "application/json",
      },
    }
  );
}
