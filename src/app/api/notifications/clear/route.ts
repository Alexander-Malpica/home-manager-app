import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// POST /api/notifications/clear
export async function POST() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const household = await getOrCreateHousehold(userId, email);

  await prisma.notification.deleteMany({
    where: { householdId: household.id },
  });

  return NextResponse.json({ message: "Notifications cleared" });
}
