import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// POST /api/maintenance/update
export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);
  const { id, title, category, description } = await req.json();

  if (!id || !title || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.maintenanceItem.updateMany({
    where: { id, householdId: household.id },
    data: { title, category, description },
  });

  return NextResponse.json(updated);
}
