import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ count: 0 });

  const count = await prisma.shoppingItem.count({
    where: { userId },
  });

  return NextResponse.json({ count });
}
