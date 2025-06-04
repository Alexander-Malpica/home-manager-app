import { useState, useEffect } from "react";

const defaultPreferences = {
  theme: "system",
  language: "en",
  notifications: { enabled: true, frequency: "daily" },
  datetime: { timezone: "UTC", dateFormat: "MM/DD/YYYY" },
  auditLog: { retentionDays: 30, showByDefault: false },
};

export default function usePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem("user-preferences");
    if (saved) setPreferences(JSON.parse(saved));
  }, []);

  const updatePreferences = (updated: Partial<typeof defaultPreferences>) => {
    const newPrefs = { ...preferences, ...updated };
    setPreferences(newPrefs);
    localStorage.setItem("user-preferences", JSON.stringify(newPrefs));
  };

  return { preferences, updatePreferences };
}
