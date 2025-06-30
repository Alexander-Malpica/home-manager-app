import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!userRes.ok) {
      console.error("Failed to fetch user from Clerk:", await userRes.text());
      return new NextResponse("Failed to verify user", { status: 500 });
    }

    const userData = await userRes.json();
    const email = userData?.email_addresses?.[0]?.email_address;

    if (!email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invite = await prisma.householdMember.findFirst({
      where: { invitedEmail: email, status: "pending" },
      include: { Household: true },
    });

    if (!invite) {
      return NextResponse.json({ hasInvite: false });
    }

    return NextResponse.json({
      hasInvite: true,
      householdId: invite.householdId,
      inviteId: invite.id,
      householdName: invite.Household.name,
    });
  } catch (error) {
    console.error("GET /api/household/invite-status failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
