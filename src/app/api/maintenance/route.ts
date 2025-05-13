import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/maintenance
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const items = await prisma.maintenanceItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

// POST /api/maintenance
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { title, category, description } = await req.json();
  if (!title || !category || !description)
    return new NextResponse("Missing fields", { status: 400 });

  const newItem = await prisma.maintenanceItem.create({
    data: {
      userId,
      title,
      category,
      description,
    },
  });

  return NextResponse.json(newItem);
}
