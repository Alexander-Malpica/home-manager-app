import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔒 Centralized auth utility
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/maintenance/update
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id, title, category, description = "" } = await req.json();

    if (!id || !title || !category) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const updated = await prisma.maintenanceItem.updateMany({
      where: { id, householdId: household.id },
      data: { title, category, description },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/maintenance/update failed:", err);
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
