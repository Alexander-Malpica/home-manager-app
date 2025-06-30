import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

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

// POST /api/chores/update
export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await getUserAuth(req);
    const { id, name, assignee, description = "" } = await req.json();

    if (!id || !name || !assignee) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const updated = await prisma.choresItem.updateMany({
      where: { id, householdId: household.id },
      data: { name, assignee, description },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/chores/update failed:", err);

    return new NextResponse(
      err instanceof Error && err.message === "Unauthorized"
        ? "Unauthorized"
        : "Internal Server Error",
      {
        status:
          err instanceof Error && err.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
}
