import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST /api/bills/update
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id, name, amount, dueDate, category } = await req.json();
  if (!id || !name || !amount || !dueDate || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.billsItem.updateMany({
    where: { id, userId },
    data: {
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category,
    },
  });

  return NextResponse.json(updated);
}
