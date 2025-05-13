import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// POST /api/chores/update
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id, name, assignee, description } = await req.json();
  if (!id || !name || !assignee)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.choresItem.updateMany({
    where: { id, userId },
    data: { name, assignee, description },
  });

  return NextResponse.json(updated);
}
