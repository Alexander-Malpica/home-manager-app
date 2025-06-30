import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

const CLERK_API_BASE = "https://api.clerk.dev/v1";
const CLERK_HEADERS = {
  Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
};

// GET /api/household/members
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const userRes = await fetch(`${CLERK_API_BASE}/users/${userId}`, {
      headers: CLERK_HEADERS,
    });

    if (!userRes.ok) return new NextResponse("Unauthorized", { status: 401 });

    const userData = await userRes.json();
    const email = userData?.email_addresses?.[0]?.email_address;
    if (!email) return new NextResponse("Unauthorized", { status: 401 });

    const household = await prisma.household.findFirst({
      where: {
        members: {
          some: {
            OR: [{ userId }, { invitedEmail: email }],
          },
        },
      },
      include: { members: true },
    });

    if (!household)
      return new NextResponse("No household found", { status: 404 });

    // Identify true owner
    const owners = household.members
      .filter((m) => m.role === "owner" && m.userId)
      .sort((a, b) => a.id.localeCompare(b.id));
    const trueOwner = owners[0];

    let trueOwnerEmail: string | null = null;
    if (trueOwner?.userId) {
      const ownerRes = await fetch(
        `${CLERK_API_BASE}/users/${trueOwner.userId}`,
        {
          headers: CLERK_HEADERS,
        }
      );
      if (ownerRes.ok) {
        const ownerData = await ownerRes.json();
        trueOwnerEmail = ownerData?.email_addresses?.[0]?.email_address || null;
      }
    }

    // Enrich members with names
    const membersWithNames = await Promise.all(
      household.members.map(async (member) => {
        if (member.userId) {
          try {
            const memberRes = await fetch(
              `${CLERK_API_BASE}/users/${member.userId}`,
              {
                headers: CLERK_HEADERS,
              }
            );
            if (memberRes.ok) {
              const memberData = await memberRes.json();
              const name = `${memberData.first_name ?? ""} ${
                memberData.last_name ?? ""
              }`.trim();
              return { ...member, name };
            }
          } catch {}
          return { ...member, name: member.userId };
        }

        return { ...member, name: member.invitedEmail || "Unknown" };
      })
    );

    return NextResponse.json({
      members: membersWithNames,
      trueOwnerId: trueOwner?.userId ?? null,
      trueOwnerEmail,
    });
  } catch (err) {
    console.error("GET /api/household/members error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/household/members
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const userRes = await fetch(`${CLERK_API_BASE}/users/${userId}`, {
      headers: CLERK_HEADERS,
    });
    const userData = await userRes.json();
    const email = userData?.email_addresses?.[0]?.email_address;
    if (!email) return new NextResponse("Unauthorized", { status: 401 });

    const household = await getOrCreateHousehold(userId, email);
    const body = await req.json();

    // Invite new member
    if (body.email) {
      const existing = await prisma.householdMember.findFirst({
        where: { householdId: household.id, invitedEmail: body.email },
      });

      if (existing) {
        return NextResponse.json({ message: "Already invited" });
      }

      const invited = await prisma.householdMember.create({
        data: {
          householdId: household.id,
          invitedEmail: body.email,
          role: "member",
        },
      });

      return NextResponse.json(invited);
    }

    // Update role
    if (body.id && body.role) {
      const validRoles = ["owner", "member", "guest"];
      if (!validRoles.includes(body.role)) {
        return new NextResponse("Invalid role", { status: 400 });
      }

      await prisma.householdMember.updateMany({
        where: { id: body.id, householdId: household.id },
        data: { role: body.role },
      });

      return NextResponse.json({ message: "Role updated" });
    }

    // Self-removal
    if (body.removeSelf === true) {
      await prisma.householdMember.deleteMany({
        where: { userId, householdId: household.id },
      });

      return NextResponse.json({ message: "You have exited the household" });
    }

    // Remove member
    if (body.id && body.remove === true) {
      await prisma.householdMember.deleteMany({
        where: { id: body.id, householdId: household.id },
      });

      return NextResponse.json({ message: "Member removed" });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (err) {
    console.error("POST /api/household/members error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
