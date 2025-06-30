"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";
import {
  Dashboard,
  ShoppingCart,
  Receipt,
  CleaningServices,
  Build,
  Group,
} from "@mui/icons-material";
import Navbar from "@/components/layout/Navbar";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { useAuth } from "@clerk/nextjs";

const navItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Shopping", icon: <ShoppingCart />, path: "/shopping" },
  { label: "Bills", icon: <Receipt />, path: "/bills" },
  { label: "Chores", icon: <CleaningServices />, path: "/chores" },
  { label: "Maintenance", icon: <Build />, path: "/maintenance" },
  { label: "Group", icon: <Group />, path: "/household" },
];

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  const { isLoaded, isSignedIn } = useAuth();

  const value = useMemo(() => {
    const index = navItems.findIndex((item) => pathname.startsWith(item.path));
    return index === -1 ? 0 : index;
  }, [pathname]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return <LoadingScreen />;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Navbar />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 2, sm: 3 },
          pb: 3,
        }}
      >
        {children}
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: `4px outset ${theme.palette.primary.main}`,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          bgcolor: theme.palette.background.paper,
          zIndex: 10,
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue) => {
            router.push(navItems[newValue].path);
          }}
          sx={{
            p: isMobile ? 1 : 2,
            ".MuiBottomNavigationAction-root": {
              minWidth: 0,
              padding: isMobile ? "6px 8px" : "8px 16px",
            },
            ".MuiSvgIcon-root": {
              fontSize: isMobile ? "1.4rem" : "1.75rem",
            },
          }}
        >
          {navItems.map(({ label, icon }) => (
            <BottomNavigationAction
              key={label}
              label={isMobile && label === "Maintenance" ? "Maint." : label}
              icon={icon}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}
