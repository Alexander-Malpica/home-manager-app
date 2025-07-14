import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔐 Central auth utility
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// GET /api/chores
export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const chores = await prisma.choresItem.findMany({
      where: { householdId: household.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(chores);
  } catch (err) {
    console.error("GET /api/chores failed:", err);
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

// POST /api/chores
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const body = await req.json();

    // ✅ Handle reorder request
    if (Array.isArray(body.orderedIds)) {
      await Promise.all(
        body.orderedIds.map((id: string, index: number) =>
          prisma.choresItem.update({
            where: { id },
            data: { position: index },
          })
        )
      );
      return new NextResponse("Positions updated", { status: 200 });
    }

    // ✅ Handle new item creation
    const { name, assignee, description = "" } = body;

    if (!name || !assignee) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const maxItem = await prisma.shoppingItem.findFirst({
      where: { householdId: household.id },
      orderBy: { position: "desc" },
    });

    const nextPosition = (maxItem?.position ?? -1) + 1;

    const newChore = await prisma.choresItem.create({
      data: {
        householdId: household.id,
        name,
        assignee,
        description,
        position: nextPosition,
      },
    });

    return NextResponse.json(newChore);
  } catch (err) {
    console.error("POST /api/chores failed:", err);
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
