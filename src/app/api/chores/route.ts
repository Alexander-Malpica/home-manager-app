// /api/chores/route.ts

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET /api/chores
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const chores = await prisma.choresItem.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chores);
  } catch (err) {
    console.error("GET /api/chores failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/chores
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, assignee, description } = body;

    if (!name || !assignee) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const household = await getOrCreateHousehold(userId, email);

    const newChore = await prisma.choresItem.create({
      data: {
        householdId: household.id,
        name,
        assignee,
        description: description || "",
      },
    });

    return NextResponse.json(newChore);
  } catch (err) {
    console.error("POST /api/chores failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
