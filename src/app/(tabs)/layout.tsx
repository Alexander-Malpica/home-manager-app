"use client";

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  CleaningServices as CleaningServicesIcon,
  Build as BuildIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Navbar from "@/components/navigation/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth } from "@clerk/nextjs";

const paths = [
  "/dashboard",
  "/shopping",
  "/bills",
  "/chores",
  "/maintenance",
  "/household",
];

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState(paths.indexOf(pathname));

  const { isLoaded, isSignedIn } = useAuth();

  // Update selected tab when path changes
  useEffect(() => {
    setValue(paths.indexOf(pathname));
  }, [pathname]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading screen while auth state is loading or redirecting
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

      {/* Scrollable main content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 2, sm: 3 },
          pt: 0,
          pb: 3,
        }}
      >
        {children}
      </Box>

      {/* Responsive sticky bottom nav */}
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
            router.push(paths[newValue]);
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
          <BottomNavigationAction
            label={isMobile ? "Maint." : "Maintenance"}
            icon={<BuildIcon />}
          />
          <BottomNavigationAction label="Group" icon={<GroupIcon />} />
        </BottomNavigation>
      </Box>
    </Box>
  );
}
