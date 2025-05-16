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
import theme from "@/theme/theme";
import Navbar from "@/components/navigation/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@clerk/nextjs";

const paths = ["/dashboard", "/shopping", "/bills", "/chores", "/maintenance"];

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(paths.indexOf(pathname));

  const { isLoaded } = useAuth();

  useEffect(() => {
    setValue(paths.indexOf(pathname));
  }, [pathname]);

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Box
      sx={{ minHeight: "100dvh", bgcolor: theme.palette.background.default }}
    >
      <Navbar />
      {children}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "4px outset #2b6cb0",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            router.push(paths[newValue]);
          }}
          sx={{ p: 4 }}
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
