import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Reusable authentication helper
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// POST /api/bills/update
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { id, name, amount, dueDate, category } = await req.json();

    if (!id || !name || !amount || !dueDate || !category) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const updated = await prisma.billsItem.updateMany({
      where: { id, householdId: household.id },
      data: {
        name,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        category,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/bills/update failed:", err);
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
