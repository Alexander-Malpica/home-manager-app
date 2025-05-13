import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/chores
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const items = await prisma.choresItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/chores failed:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/chores
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { name, assignee, description } = await req.json();
  if (!name || !assignee || !description)
    return new NextResponse("Missing fields", { status: 400 });

  const newItem = await prisma.choresItem.create({
    data: {
      userId,
      name,
      assignee,
      description,
    },
  });

  return NextResponse.json(newItem);
}
