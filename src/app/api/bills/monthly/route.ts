import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { addMonths, subMonths, format, startOfMonth } from "date-fns";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Utility to get authenticated user info
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) throw new Error("Unauthorized");

  return { userId, email };
}

// GET /api/bills/monthly
export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const now = new Date();
    const months = [
      subMonths(now, 2),
      subMonths(now, 1),
      now,
      addMonths(now, 1),
      addMonths(now, 2),
    ];

    const data = await Promise.all(
      months.map(async (date) => {
        const from = startOfMonth(date);
        const to = startOfMonth(addMonths(date, 1));

        const [total, paid] = await Promise.all([
          prisma.billsItem.aggregate({
            _sum: { amount: true },
            where: {
              householdId: household.id,
              dueDate: { gte: from, lt: to },
            },
          }),
          prisma.billsItem.aggregate({
            _sum: { amount: true },
            where: {
              householdId: household.id,
              checked: true,
              dueDate: { gte: from, lt: to },
            },
          }),
        ]);

        return {
          month: format(date, "MMM"),
          total: total._sum.amount || 0,
          paid: paid._sum.amount || 0,
        };
      })
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/bills/overview failed:", err);
    return new NextResponse(
      err instanceof Error && err.message === "Unauthorized"
        ? "Unauthorized"
        : "Internal Server Error",
      {
        status:
          err instanceof Error && err.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
}
