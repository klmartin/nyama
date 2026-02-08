import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");

  let query = `
    SELECT
      id,
      title,
      category,
      amount,
      expense_date,
      notes
    FROM expenses
    WHERE 1=1
  `;

  let totalQuery = `
    SELECT SUM(amount) AS total
    FROM expenses
    WHERE 1=1
  `;

  const params = [];
  const totalParams = [];

  if (from) {
    query += " AND expense_date >= ?";
    totalQuery += " AND expense_date >= ?";
    params.push(from);
    totalParams.push(from);
  }

  if (to) {
    query += " AND expense_date <= ?";
    totalQuery += " AND expense_date <= ?";
    params.push(to);
    totalParams.push(to);
  }

  if (category) {
    query += " AND category = ?";
    totalQuery += " AND category = ?";
    params.push(category);
    totalParams.push(category);
  }

  query += " ORDER BY expense_date DESC";

  const [rows] = await db.query(query, params);
  const [[total]] = await db.query(totalQuery, totalParams);

  return NextResponse.json({
    expenses: rows,
    total: total.total || 0,
  });
}
