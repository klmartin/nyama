import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { message: "Month is required" },
        { status: 400 }
      );
    }

    const [[sales]] = await db.query(
      `
      SELECT SUM(total_amount) AS total
      FROM sales
      WHERE DATE_FORMAT(sale_date, '%Y-%m') = ?
      `,
      [month]
    );

    const [[purchases]] = await db.query(
      `
      SELECT SUM(total_cost) AS total
      FROM purchases
      WHERE DATE_FORMAT(purchase_date, '%Y-%m') = ?
      `,
      [month]
    );

    const totalSales = Number(sales.total || 0);
    const totalPurchases = Number(purchases.total || 0);

    return NextResponse.json({
      totalSales,
      totalPurchases,
      profit: totalSales - totalPurchases,
    });
  } catch (error) {
    console.error("Profit report error:", error);
    return NextResponse.json(
      { message: "Failed to load profit report" },
      { status: 500 }
    );
  }
}
