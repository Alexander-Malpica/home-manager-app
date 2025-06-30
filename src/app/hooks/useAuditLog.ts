import { useEffect, useState } from "react";

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  itemType: string;
  itemName: string;
  createdAt: string;
}

interface Filters {
  user: string;
  action: string;
}

export default function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({ user: "", action: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          user: filters.user,
          action: filters.action,
        });

        const res = await fetch(`/api/audit-log?${params}`);
        const data = await res.json();

        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, filters, refreshToken]);

  const addLog = async (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    try {
      await fetch("/api/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      setRefreshToken((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to add audit log:", error);
    }
  };

  return {
    logs,
    addLog,
    page,
    setPage,
    total,
    filters,
    setFilters,
    isLoading,
  };
}
