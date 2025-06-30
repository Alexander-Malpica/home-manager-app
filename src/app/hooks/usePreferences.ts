import { useEffect, useState } from "react";

type Preferences = typeof defaultPreferences;

const defaultPreferences = {
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    frequency: "daily",
  },
  datetime: {
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  },
  auditLog: {
    retentionDays: 30,
    showByDefault: false,
  },
};

export default function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem("user-preferences");
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("user-preferences", JSON.stringify(preferences));
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  }, [preferences]);

  const updatePreferences = (updated: Partial<Preferences>) => {
    setPreferences((prev: Preferences) => ({
      ...prev,
      ...updated,
    }));
  };

  return { preferences, updatePreferences };
}
