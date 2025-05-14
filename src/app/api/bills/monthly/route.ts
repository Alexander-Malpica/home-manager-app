import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { eachMonthOfInterval, format } from "date-fns";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json([]);

  const months = eachMonthOfInterval({
    start: new Date(new Date().getFullYear(), 0),
    end: new Date(new Date().getFullYear(), 11),
  });

  const data = await Promise.all(
    months.map(async (date) => {
      const month = date.getMonth();
      const year = date.getFullYear();

      const total = await prisma.billsItem.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          dueDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
      });

      return {
        month: format(date, "MMM"),
        total: total._sum.amount || 0,
      };
    })
  );

  return NextResponse.json(data);
}
