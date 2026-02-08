import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET expenses (with optional date filter)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let sql = `SELECT * FROM expenses WHERE 1=1`;
    const params = [];

    if (from) {
      sql += " AND expense_date >= ?";
      params.push(from);
    }

    if (to) {
      sql += " AND expense_date <= ?";
      params.push(to);
    }

    sql += " ORDER BY expense_date DESC";

    const [rows] = await db.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// CREATE expense
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      amount,
      expense_date,
      payment_method,
      notes,
    } = body;

    if (!title || !category || !amount || !expense_date) {
      return NextResponse.json(
        { message: "Required fields missing" },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO expenses
       (title, category, amount, expense_date, payment_method, notes)
       VALUES (?,?,?,?,?,?)`,
      [
        title,
        category,
        amount,
        expense_date,
        payment_method || "CASH",
        notes || null,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create expense" },
      { status: 500 }
    );
  }
}

// UPDATE expense
export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      category,
      amount,
      expense_date,
      payment_method,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Expense ID required" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE expenses SET
        title=?,
        category=?,
        amount=?,
        expense_date=?,
        payment_method=?,
        notes=?
       WHERE id=?`,
      [
        title,
        category,
        amount,
        expense_date,
        payment_method,
        notes,
        id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await db.query(`DELETE FROM expenses WHERE id=?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
