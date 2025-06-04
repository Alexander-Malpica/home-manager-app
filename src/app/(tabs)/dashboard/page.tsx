"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import BillsChart from "@/components/dashboard/BillsChart";
import LoadingScreen from "@/components/LoadingScreen";

interface MonthlyBill {
  month: string;
  total: number;
  paid: number;
}

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [counts, setCounts] = useState({
    bills: 0,
    chores: 0,
    shopping: 0,
    maintenance: 0,
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyBill[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // 🔒 Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // ✅ Data fetching after auth check
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const initialize = async () => {
      setIsFetching(true);
      try {
        await fetch("/api/household/init");

        const endpoints = {
          bills: "/api/bills/count",
          chores: "/api/chores/count",
          shopping: "/api/shopping/count",
          maintenance: "/api/maintenance/count",
        };

        const data = await Promise.all(
          Object.entries(endpoints).map(async ([key, url]) => {
            const res = await fetch(url);
            const json = await res.json();
            return [key, json.count ?? 0];
          })
        );

        setCounts(Object.fromEntries(data));

        const res = await fetch("/api/bills/monthly");
        const json = await res.json();
        setMonthlyData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setIsFetching(false);
      }
    };

    initialize();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isFetching) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return null; // temporary while redirect happens
  }

  const firstName = user?.firstName || "there";

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const formattedDate = format(now, "EEEE, MMMM d, yyyy");

  return (
    <Box
      sx={{
        p: 2,
        mx: "auto",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <DashboardHeader
        name={firstName}
        greeting={greeting}
        date={formattedDate}
      />
      <Box px={{ xs: 2, sm: 3 }}>
        <SummaryCards counts={counts} />
        <Box mt={4}>
          <BillsChart data={monthlyData} />
        </Box>
      </Box>
    </Box>
  );
}
