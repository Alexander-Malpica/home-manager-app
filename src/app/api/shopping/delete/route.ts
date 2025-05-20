import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";
import { createNotification } from "@/app/lib/notifications";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);
  const { id } = await req.json();

  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const deleted = await prisma.shoppingItem.delete({
    where: { id, householdId: household.id },
  });

  await createNotification({
    householdId: household.id,
    type: "shopping",
    title: "Item Removed",
    body: `You completed: ${deleted.name}`,
  });

  return NextResponse.json(deleted);
}
