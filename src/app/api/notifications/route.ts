import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET /api/notifications
export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const household = await getOrCreateHousehold(userId, email);

  const notifications = await prisma.notification.findMany({
    where: { householdId: household.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}
