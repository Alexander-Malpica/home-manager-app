import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const count = await prisma.shoppingItem.count({
      where: { householdId: household.id },
    });

    return NextResponse.json({ count });
  } catch (err: unknown) {
    console.error("GET /api/shopping/count failed:", err);

    // Gracefully return 0 if unauthorized, otherwise error
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ count: 0 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
