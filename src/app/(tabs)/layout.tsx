// src/app/(tabs)/layout.tsx
"use client";

import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildIcon from "@mui/icons-material/Build";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";

const paths = ["/dashboard", "/shopping", "/bills", "/chores", "/maintenance"];

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(paths.indexOf(pathname));

  useEffect(() => {
    setValue(paths.indexOf(pathname));
  }, [pathname]);

  return (
    <Box sx={{ pb: 7, minHeight: "100vh" }}>
      {children}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            router.push(paths[newValue]);
          }}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction
            label="Shopping"
            icon={<ShoppingCartIcon />}
          />
          <BottomNavigationAction label="Bills" icon={<ReceiptIcon />} />
          <BottomNavigationAction
            label="Chores"
            icon={<CleaningServicesIcon />}
          />
          <BottomNavigationAction label="Maintenance" icon={<BuildIcon />} />
        </BottomNavigation>
      </Box>
    </Box>
  );
}
