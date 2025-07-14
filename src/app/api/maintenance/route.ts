import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

// 🔒 Auth utility
async function getUserAuth() {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return { userId, email };
}

// GET /api/maintenance
export async function GET() {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const items = await prisma.maintenanceItem.findMany({
      where: { householdId: household.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/maintenance failed:", err);
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

// POST /api/maintenance
export async function POST(req: Request) {
  try {
    const { userId, email } = await getUserAuth();
    const household = await getOrCreateHousehold(userId, email);

    const body = await req.json();

    // ✅ Handle reorder request
    if (Array.isArray(body.orderedIds)) {
      await Promise.all(
        body.orderedIds.map((id: string, index: number) =>
          prisma.maintenanceItem.update({
            where: { id },
            data: { position: index },
          })
        )
      );
      return new NextResponse("Positions updated", { status: 200 });
    }

    // ✅ Handle new item creation
    const { title, category, description = "" } = body;

    if (!title || !category) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const maxItem = await prisma.shoppingItem.findFirst({
      where: { householdId: household.id },
      orderBy: { position: "desc" },
    });

    const nextPosition = (maxItem?.position ?? -1) + 1;

    const newItem = await prisma.maintenanceItem.create({
      data: {
        householdId: household.id,
        title,
        category,
        description,
        position: nextPosition,
      },
    });

    return NextResponse.json(newItem);
  } catch (err) {
    console.error("POST /api/maintenance failed:", err);
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
