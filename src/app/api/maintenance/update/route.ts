import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST /api/maintenance/update
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id, title, category, description } = await req.json();
  if (!id || !title || !category || !description)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.maintenanceItem.updateMany({
    where: { id, userId },
    data: { title, category, description },
  });

  return NextResponse.json(updated);
}
