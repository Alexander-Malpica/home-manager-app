import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Shared auth utility
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/notifications/delete
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id } = await req.json();

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const household = await getOrCreateHousehold(userId, email);

    await prisma.notification.deleteMany({
      where: {
        id,
        householdId: household.id,
      },
    });

    return NextResponse.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("POST /api/notifications/delete failed:", err);

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
