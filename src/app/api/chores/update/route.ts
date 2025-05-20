import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId || !email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const household = await getOrCreateHousehold(userId, email);
  const { id, name, assignee, description } = await req.json();

  if (!id || !name || !assignee) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const updated = await prisma.choresItem.updateMany({
    where: { id, householdId: household.id },
    data: { name, assignee, description },
  });

  return NextResponse.json(updated);
}
