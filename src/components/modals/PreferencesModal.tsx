"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { usePreferences } from "@/theme/PreferencesContext";

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

type ThemeOption = "system" | "light" | "dark";
type LanguageOption = "en" | "es" | "fr" | "it" | "jp";

const preferencesSections = [
  "General",
  "Notifications",
  "Date & Time",
  "Audit Log",
];

const contentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mt: 2,
  minHeight: 220,
};

export default function PreferencesModal({
  open,
  onClose,
}: PreferencesModalProps) {
  const [tab, setTab] = useState(0);
  const { theme, setTheme, language, setLanguage } = usePreferences();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [timeZone, setTimeZone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [logRetention, setLogRetention] = useState("30");
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          ⚙️ Preferences
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {preferencesSections.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <DialogContent>
        {tab === 0 && (
          <Box sx={contentStyle}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={theme}
                label="Theme"
                onChange={(e) => setTheme(e.target.value as ThemeOption)}
              >
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value as LanguageOption)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="it">Italian</MenuItem>
                <MenuItem value="jp">Japanese</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={contentStyle}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={frequency}
                label="Frequency"
                onChange={(e) => setFrequency(e.target.value)}
              >
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={contentStyle}>
            <FormControl fullWidth>
              <InputLabel>Time Zone</InputLabel>
              <Select
                value={timeZone}
                label="Time Zone"
                onChange={(e) => setTimeZone(e.target.value)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="America/New_York">New York</MenuItem>
                <MenuItem value="Europe/London">London</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={dateFormat}
                label="Date Format"
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {tab === 3 && (
          <Box sx={contentStyle}>
            <FormControl fullWidth>
              <InputLabel>Log Retention</InputLabel>
              <Select
                value={logRetention}
                label="Log Retention"
                onChange={(e) => setLogRetention(e.target.value)}
              >
                <MenuItem value="30">30 days</MenuItem>
                <MenuItem value="90">90 days</MenuItem>
                <MenuItem value="365">1 year</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={showAuditLogs}
                  onChange={(e) => setShowAuditLogs(e.target.checked)}
                />
              }
              label="Show Audit Logs by Default"
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
