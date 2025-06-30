import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";
import { createNotification } from "@/app/lib/notifications";

// 🔒 Centralized user authentication utility
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/maintenance/delete
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const deleted = await prisma.maintenanceItem.delete({
      where: { id, householdId: household.id },
    });

    await createNotification({
      householdId: household.id,
      type: "maintenance",
      title: "Maintenance Completed",
      body: `Task completed: ${deleted.title}`,
    });

    return NextResponse.json(deleted);
  } catch (err) {
    console.error("POST /api/maintenance/delete failed:", err);
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
