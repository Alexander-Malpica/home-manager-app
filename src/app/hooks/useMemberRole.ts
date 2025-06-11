import { useEffect, useState } from "react";

interface Member {
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  role: "owner" | "member" | "guest"; // Strong typing
  name?: string;
}

export function useMemberRole(userId?: string | null) {
  const [role, setRole] = useState<"owner" | "member" | "guest" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchRole() {
      try {
        const res = await fetch("/api/household/members");
        if (!res.ok) throw new Error("Failed to fetch members");

        const data: { members: Member[] } = await res.json();
        const current = data.members.find((m) => m.userId === userId);
        setRole(current?.role ?? null);
      } catch (err) {
        console.error("Failed to get role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [userId]);

  return { role, loading };
}
