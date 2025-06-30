import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
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

// GET /api/shopping
export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const items = await prisma.shoppingItem.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/shopping failed:", err);
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

// POST /api/shopping
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const { name, category } = await req.json();

    if (!name || !category) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const newItem = await prisma.shoppingItem.create({
      data: {
        householdId: household.id,
        name,
        category,
      },
    });

    return NextResponse.json(newItem);
  } catch (err) {
    console.error("POST /api/shopping failed:", err);
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
