import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email) return NextResponse.json({ count: 0 });

  const household = await getOrCreateHousehold(userId, email);

  const count = await prisma.billsItem.count({
    where: { householdId: household.id },
  });

  return NextResponse.json({ count });
}
