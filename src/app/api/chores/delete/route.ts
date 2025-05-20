import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { createNotification } from "@/app/lib/notifications";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId || !email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const household = await getOrCreateHousehold(userId, email);
    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const deleted = await prisma.choresItem.delete({
      where: {
        id,
        householdId: household.id,
      },
    });

    await createNotification({
      householdId: household.id,
      type: "chores",
      title: "Chore Completed",
      body: `You completed: ${deleted.name}`,
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("❌ Error in /api/chores/delete:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
