import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createNotification } from "@/app/lib/notifications";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);
  const { id } = await req.json();

  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const deleted = await prisma.billsItem.delete({
    where: { id, householdId: household.id },
  });

  await createNotification({
    householdId: household.id,
    type: "bills",
    title: "Bill Paid",
    body: `You paid: ${deleted.name} for $${deleted.amount}`,
  });

  return NextResponse.json(deleted);
}
