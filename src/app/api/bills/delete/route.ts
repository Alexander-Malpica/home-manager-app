import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createNotification } from "@/app/lib/notifications";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Utility function to centralize user validation
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/bills/delete
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return new NextResponse("Missing or invalid ID", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const deleted = await prisma.billsItem.delete({
      where: {
        id,
        householdId: household.id,
      },
    });

    await createNotification({
      householdId: household.id,
      type: "bills",
      title: "Bill Paid",
      body: `You paid: ${deleted.name} for $${deleted.amount}`,
    });

    return NextResponse.json(deleted);
  } catch (err) {
    console.error("POST /api/bills/delete failed:", err);
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
