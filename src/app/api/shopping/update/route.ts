// app/api/shopping/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id, name, category } = await req.json();
  if (!id || !name || !category)
    return new NextResponse("Missing fields", { status: 400 });

  const updated = await prisma.shoppingItem.updateMany({
    where: { id, userId },
    data: { name, category },
  });

  return NextResponse.json(updated);
}
