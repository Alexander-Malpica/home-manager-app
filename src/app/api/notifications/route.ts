import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Shared user authentication logic
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// GET /api/notifications
export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const notifications = await prisma.notification.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error("GET /api/notifications failed:", err);

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
