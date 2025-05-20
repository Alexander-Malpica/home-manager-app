import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);
  const { id, name, amount, dueDate, category } = await req.json();

  if (!id || !name || !amount || !dueDate || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.billsItem.updateMany({
    where: { id, householdId: household.id },
    data: {
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category,
    },
  });

  return NextResponse.json(updated);
}
