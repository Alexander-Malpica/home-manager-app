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
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFilters] = useState<Filters>({ user: "", action: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<number>(0); // force re-fetch

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
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters, trigger]);

  const addLog = async (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
    await fetch("/api/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    setTrigger((t) => t + 1); // trigger refresh
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
