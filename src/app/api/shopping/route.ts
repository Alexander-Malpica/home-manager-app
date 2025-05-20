import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET /api/shopping
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId || !email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ✅ Get household directly (owner or member)
    const household = await getOrCreateHousehold(userId, email);

    const items = await prisma.shoppingItem.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/shopping failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/shopping
export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!userId || !email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

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
}
