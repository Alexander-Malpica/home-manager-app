import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { addMonths, subMonths, format } from "date-fns";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

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
      const month = date.getMonth();
      const year = date.getFullYear();

      const total = await prisma.billsItem.aggregate({
        _sum: { amount: true },
        where: {
          householdId: household.id,
          dueDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
      });

      const paid = await prisma.billsItem.aggregate({
        _sum: { amount: true },
        where: {
          householdId: household.id,
          checked: true,
          dueDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
      });

      return {
        month: format(date, "MMM"),
        total: total._sum.amount || 0,
        paid: paid._sum.amount || 0,
      };
    })
  );

  return NextResponse.json(data);
}
