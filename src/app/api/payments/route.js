import { NextResponse } from "next/server";
import {db} from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.toUpperCase();

    let sql = `
      SELECT
        p.id,
        p.type,
        p.reference_id,
        p.amount,
        p.payment_method,
        p.payment_date,
        p.notes,
        p.created_at,
        CASE
          WHEN p.type = 'CUSTOMER' THEN c.name
          WHEN p.type = 'VENDOR'   THEN v.name
          ELSE 'Unknown'
        END AS party_name,
        CASE
          WHEN p.type = 'CUSTOMER' THEN s.customer_id
          WHEN p.type = 'VENDOR'   THEN pu.vendor_id
        END AS actual_party_id
      FROM payments p
      LEFT JOIN sales s 
        ON p.type = 'CUSTOMER' AND p.reference_id = s.id
      LEFT JOIN customers c 
        ON p.type = 'CUSTOMER' AND s.customer_id = c.id
      LEFT JOIN purchases pu 
        ON p.type = 'VENDOR' AND p.reference_id = pu.id
      LEFT JOIN vendors v 
        ON p.type = 'VENDOR' AND pu.vendor_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (type) {
      sql += " AND p.type = ?";
      params.push(type);
    }

    sql += " ORDER BY p.payment_date DESC, p.created_at DESC";

    const [rows] = await db.query(sql, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Payments API error:", error);
    return NextResponse.json(
      { error: "Failed to load payments" },
      { status: 500 }
    );
  }
}

// export async function POST(req) {
//   const body = await req.json();
//   const {
//     type,
//     reference_id,
//     amount,
//     payment_method,
//     payment_date,
//     notes,
//   } = body;

//   if (!type || !reference_id || !amount) {
//     return NextResponse.json(
//       { error: "Missing fields" },
//       { status: 400 }
//     );
//   }

//   await db.query(
//     `INSERT INTO payments
//      (type, reference_id, amount, payment_method, payment_date, notes)
//      VALUES (?,?,?,?,?,?)`,
//     [
//       type,
//       reference_id,
//       amount,
//       payment_method || "CASH",
//       payment_date,
//       notes,
//     ]
//   );

//   return NextResponse.json({ success: true });
// }

// /api/payments/route.js (POST)


export async function POST(req) {
  const connection = await db.getConnection();

  try {
    const body = await req.json();

    const {
      type, // 'CUSTOMER' or 'VENDOR'
      reference_id, // sale_id or purchase_id
      amount,
      payment_method,
      payment_date,
      notes,
    } = body;

    if (!type || !reference_id || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    await connection.beginTransaction();

    // 1. Insert the payment
    const [paymentResult] = await connection.query(
      `INSERT INTO payments 
       (type, reference_id, amount, payment_method, payment_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [type, reference_id, amount, payment_method, payment_date, notes]
    );

    const paymentId = paymentResult.insertId;

    // 2. Update the corresponding sale or purchase
    let tableName, totalField, paidField, statusField;
    let idField;

    if (type === 'CUSTOMER') {
      tableName = 'sales';
      idField = 'id';
      totalField = 'total_amount'; // adjust if your sales table uses different name
      paidField = 'paid_amount';
      statusField = 'payment_status';
    } else if (type === 'VENDOR') {
      tableName = 'purchases';
      idField = 'id';
      totalField = 'total_cost';
      paidField = 'paid_amount';
      statusField = 'payment_status';
    } else {
      throw new Error("Invalid type");
    }

    // Get current paid and total
    const [txRows] = await connection.query(
      `SELECT ${totalField}, ${paidField} FROM ${tableName} WHERE ${idField} = ?`,
      [reference_id]
    );

    if (txRows.length === 0) {
      throw new Error("Transaction not found");
    }

    const total = Number(txRows[0][totalField]);
    const currentPaid = Number(txRows[0][paidField] || 0);
    const newPaid = currentPaid + Number(amount);

    const newStatus = newPaid >= total ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'UNPAID');

    // Update
    await connection.query(
      `UPDATE ${tableName} 
       SET ${paidField} = ?, ${statusField} = ? 
       WHERE ${idField} = ?`,
      [newPaid, newStatus, reference_id]
    );

    await connection.commit();

    return NextResponse.json({ success: true, payment_id: paymentId });
  } catch (error) {
    await connection.rollback();
    console.error("Payment failed:", error);
    return NextResponse.json({ error: error.message || "Failed to record payment" }, { status: 500 });
  } finally {
    connection.release();
  }
}