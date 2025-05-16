"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import BillsChart from "@/components/dashboard/BillsChart";
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const [counts, setCounts] = useState({
    bills: 0,
    chores: 0,
    shopping: 0,
    maintenance: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchCounts() {
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
          return [key, json.count];
        })
      );
      setCounts(Object.fromEntries(data));
    }

    async function fetchMonthly() {
      const res = await fetch("/api/bills/monthly");
      const json = await res.json();
      setMonthlyData(json);
    }

    fetchCounts();
    fetchMonthly();
  }, [isLoaded]);

  if (!isLoaded) return <LoadingScreen />;

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
        minHeight: "100dvh",
        boxSizing: "border-box",
      }}
    >
      <DashboardHeader
        name={firstName}
        greeting={greeting}
        date={formattedDate}
      />
      <SummaryCards counts={counts} />
      <BillsChart data={monthlyData} />
    </Box>
  );
}
