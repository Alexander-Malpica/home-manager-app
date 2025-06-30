import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { inviteId } = await req.json();
    if (typeof inviteId !== "string" || !inviteId.trim()) {
      return new NextResponse("Missing or invalid invite ID", { status: 400 });
    }

    await prisma.householdMember.update({
      where: { id: inviteId },
      data: {
        userId,
        status: "accepted",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("❌ Error accepting household invite:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
