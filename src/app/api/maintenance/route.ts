import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET /api/maintenance
export async function GET() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);

  const items = await prisma.maintenanceItem.findMany({
    where: { householdId: household.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/maintenance
export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !email)
    return new NextResponse("Unauthorized", { status: 401 });

  const { title, category, description } = await req.json();
  if (!title || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const household = await getOrCreateHousehold(userId, email);

  const newItem = await prisma.maintenanceItem.create({
    data: {
      householdId: household.id,
      title,
      category,
      description: description || "",
    },
  });

  return NextResponse.json(newItem);
}
