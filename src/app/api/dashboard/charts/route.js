import {db} from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {

  const [revenue] = await db.query(`
    SELECT DATE_FORMAT(created_at,'%Y-%m') month,
           SUM(total_amount) total
    FROM sales
    GROUP BY month
    ORDER BY month
  `);

  const [units] = await db.query(`
    SELECT DATE_FORMAT(s.created_at,'%Y-%m') month,
           SUM(si.quantity) total
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    GROUP BY month
    ORDER BY month
  `);

  const [purchases] = await db.query(`
    SELECT DATE_FORMAT(created_at,'%Y-%m') month,
           SUM(total_cost) total
    FROM purchases
    GROUP BY month
    ORDER BY month
  `);

  const [inventory] = await db.query(`
    SELECT DATE_FORMAT(created_at,'%Y-%m') month,
           SUM(quantity) total
    FROM sale_items
    GROUP BY month
    ORDER BY month
  `);

  return NextResponse.json({
    revenue,
    units,
    purchases,
    inventory,
  });
}
