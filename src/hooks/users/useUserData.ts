"use client";
import { useState, useEffect, useCallback } from "react";

interface UserData {
  uid?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: string;
  email?: string;
  phoneNumber?: string;
}

export const useUserData = () => {
  const [storedUser, setStoredUser] = useState<UserData>({});

  const updateUserData = useCallback(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setStoredUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    // Initial load
    updateUserData();

    // Listen for storage changes (when profile is updated in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        const parsedUser = JSON.parse(e.newValue);
        setStoredUser(parsedUser);
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleUserDataUpdate = () => {
      updateUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userDataUpdated", handleUserDataUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userDataUpdated", handleUserDataUpdate);
    };
  }, [updateUserData]);

  return { storedUser, updateUserData };
};
