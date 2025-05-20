// /api/household/accept/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { inviteId } = await req.json();
  if (!inviteId) return new NextResponse("Missing invite ID", { status: 400 });

  await prisma.householdMember.update({
    where: { id: inviteId },
    data: { userId, status: "accepted" },
  });

  return NextResponse.json({ success: true });
}
