import { useEffect, useState } from "react";

interface Member {
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  role: "owner" | "member" | "guest";
  name?: string;
}

export function useMemberRole(userId?: string | null) {
  const [role, setRole] = useState<"owner" | "member" | "guest" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const res = await fetch("/api/household/members");
        if (!res.ok) throw new Error("Failed to fetch members");

        const { members }: { members: Member[] } = await res.json();
        const user = members.find((m) => m.userId === userId);

        setRole(user?.role ?? null);
      } catch (error) {
        console.error("useMemberRole: Error fetching member role", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [userId]);

  return { role, loading };
}
