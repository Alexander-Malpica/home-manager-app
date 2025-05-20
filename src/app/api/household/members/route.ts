import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { getOrCreateHousehold } from "@/app/lib/household";

// GET all household members with names
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Get the current user from Clerk
  const userRes = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });

  if (!userRes.ok) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await userRes.json();
  const email = user?.email_addresses?.[0]?.email_address;
  if (!email) return new NextResponse("Unauthorized", { status: 401 });

  // Find household by either userId or invitedEmail
  const household = await prisma.household.findFirst({
    where: {
      members: {
        some: {
          OR: [{ userId: userId }, { invitedEmail: email }],
        },
      },
    },
    include: { members: true },
  });

  if (!household) {
    return new NextResponse("No household found", { status: 404 });
  }

  // Resolve each member's name
  const membersWithNames = await Promise.all(
    household.members.map(async (member) => {
      let name = member.invitedEmail || "Unknown";
      if (member.userId) {
        try {
          const userRes = await fetch(
            `https://api.clerk.dev/v1/users/${member.userId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              },
            }
          );
          if (userRes.ok) {
            const user = await userRes.json();
            name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
          } else {
            name = member.userId;
          }
        } catch {
          name = member.userId;
        }
      }

      return {
        ...member,
        name,
      };
    })
  );

  return NextResponse.json(membersWithNames);
}

// POST: Invite user OR update role OR remove member
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then((res) => res.json());

  const email = user?.email_addresses?.[0]?.email_address;
  if (!email) return new NextResponse("Unauthorized", { status: 401 });

  const household = await getOrCreateHousehold(userId, email);
  const body = await req.json();

  // ✅ Handle invite
  if (body.email) {
    const alreadyInvited = await prisma.householdMember.findFirst({
      where: {
        householdId: household.id,
        invitedEmail: body.email,
      },
    });

    if (alreadyInvited) {
      return NextResponse.json({ message: "Already invited" });
    }

    const invited = await prisma.householdMember.create({
      data: {
        householdId: household.id,
        invitedEmail: body.email,
        role: "member", // default role for invite
      },
    });

    return NextResponse.json(invited);
  }

  // ✅ Handle role update
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

  // ✅ Handle remove
  if (body.id && body.remove === true) {
    await prisma.householdMember.deleteMany({
      where: { id: body.id, householdId: household.id },
    });

    return NextResponse.json({ message: "Member removed" });
  }

  return new NextResponse("Invalid request", { status: 400 });
}
