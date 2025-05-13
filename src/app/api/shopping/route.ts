import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// GET /api/shopping
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const items = await prisma.shoppingItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/shopping failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/shopping
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { name, category } = body;

  if (!name || !category) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const newItem = await prisma.shoppingItem.create({
    data: {
      userId,
      name,
      category,
    },
  });

  return NextResponse.json(newItem);
}
