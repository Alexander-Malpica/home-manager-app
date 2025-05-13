// app/api/shopping/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await req.json();
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  const deleted = await prisma.shoppingItem.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json(deleted);
}
