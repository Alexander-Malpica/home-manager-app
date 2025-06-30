import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateHousehold } from "@/app/lib/household";

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId || !email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const household = await getOrCreateHousehold(userId, email);

    return Response.json({ householdId: household.id });
  } catch (err: unknown) {
    console.error("❌ Failed to retrieve household ID:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
