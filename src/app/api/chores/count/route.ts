import { NextRequest, NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Shared user authentication logic
async function getUserAuth(req: NextRequest) {
  const { userId } = getAuth(req);
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// GET /api/chores/count
export async function GET(req: NextRequest) {
  try {
    const { userId, email } = await getUserAuth(req);
    const household = await getOrCreateHousehold(userId, email);

    const count = await prisma.choresItem.count({
      where: { householdId: household.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("❌ Error in GET /api/chores/count:", error);

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
