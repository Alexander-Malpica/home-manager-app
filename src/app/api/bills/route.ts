import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET /api/bills
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;

    if (!userId || !email)
      return new NextResponse("Unauthorized", { status: 401 });

    const household = await getOrCreateHousehold(userId, email);

    const items = await prisma.billsItem.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/bills failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/bills
export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const { name, amount, dueDate, category } = await req.json();

  if (!name || !amount || !dueDate || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const household = await getOrCreateHousehold(userId, email);

  const newItem = await prisma.billsItem.create({
    data: {
      householdId: household.id,
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category,
    },
  });

  return NextResponse.json(newItem);
}
