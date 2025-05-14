"use client";

import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";

const DashboardHeader = () => {
  const { user } = useUser();
  const firstName = user?.firstName || "friend";

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const formattedDate = format(now, "EEEE, MMMM d, yyyy");

  return (
    <div>
      <h2>{`${greeting}, ${firstName}!`}</h2>
      <p>{formattedDate}</p>
    </div>
  );
};

export default DashboardHeader;
