"use client";
import { useState, useEffect } from "react";

// Types
export interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
}

interface ProfileResponse {
  statusCode: number;
  message: string;
  data: UserProfile;
}

interface ProfileError {
  message: string;
  statusCode: number;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get user data from localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          setProfile({
            fullName: parsedData.fullName || "",
            email: parsedData.email || "",
            phoneNumber: parsedData.phoneNumber || "",
            profilePicture: parsedData.profilePicture || "",
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // Then try to fetch from API
      const token = localStorage.getItem("session_token");
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      const response = await fetch(
        "http://kuwagoapi.somee.com/api/User/Profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData: ProfileError = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile");
      }

      const data: ProfileResponse = await response.json();
      setProfile({
        ...data.data,
        profilePicture: data.data.profilePicture || "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("session_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://kuwagoapi.somee.com/api/User/UpdateProfile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        const errorData: ProfileError = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data: ProfileResponse = await response.json();
      setProfile((prev) => ({
        ...prev,
        ...data.data,
        profilePicture: data.data.profilePicture || prev.profilePicture,
      }));

      // Update localStorage with new data
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedData,
              ...data.data,
            })
          );
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating profile"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
};
