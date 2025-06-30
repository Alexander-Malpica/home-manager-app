import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";
import { createNotification } from "@/app/lib/notifications";

// 🔐 Central user validation utility
async function getUserAuth(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/chores/delete
export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await getUserAuth(req);
    const { id } = await req.json();

    if (typeof id !== "string" || !id.trim()) {
      return new NextResponse("Missing or invalid ID", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const deleted = await prisma.choresItem.delete({
      where: { id, householdId: household.id },
    });

    await createNotification({
      householdId: household.id,
      type: "chores",
      title: "Chore Completed",
      body: `You completed: ${deleted.name}`,
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("❌ Error in POST /api/chores/delete:", error);

    return new NextResponse(
      error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Internal Server Error",
      {
        status:
          error instanceof Error && error.message === "Unauthorized"
            ? 401
            : 500,
      }
    );
  }
}
