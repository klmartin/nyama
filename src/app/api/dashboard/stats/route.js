import {db} from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [[payments]] = await db.query(
    "SELECT COALESCE(SUM(amount),0) total FROM payments"
  );

  const [[customers]] = await db.query(
    "SELECT COUNT(*) total FROM customers"
  );

  const [[unpaid]] = await db.query(
    "SELECT COALESCE(SUM(total_amount),0) total FROM sales WHERE payment_status='UNPAID'"
  );

  const [[stock]] = await db.query(
    "SELECT COALESCE(SUM(stock_quantity),0) total FROM products"
  );

  return NextResponse.json({
    totalPayments: payments.total,
    totalCustomers: customers.total,
    unpaidBalances: unpaid.total,
    totalStock: stock.total,
  });
}
