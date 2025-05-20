import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId || !email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const household = await getOrCreateHousehold(userId, email);
  const count = await prisma.choresItem.count({
    where: { householdId: household.id },
  });

  return NextResponse.json({ count });
}
