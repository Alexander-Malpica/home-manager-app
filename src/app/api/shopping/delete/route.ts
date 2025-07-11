import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";
import { createNotification } from "@/app/lib/notifications";

async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const deleted = await prisma.shoppingItem.delete({
      where: {
        id,
        householdId: household.id,
      },
    });

    await createNotification({
      householdId: household.id,
      type: "shopping",
      title: "Item Removed",
      body: `You completed: ${deleted.name}`,
    });

    return NextResponse.json(deleted);
  } catch (err: unknown) {
    let message = "Internal Server Error";
    let status = 500;

    if (err instanceof Error) {
      message = err.message;
      if (message === "Unauthorized") status = 401;
    }

    console.error("POST /api/shopping/delete failed:", err);
    return new NextResponse(message, { status });
  }
}
