"use client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import axios from "axios";

// Types
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | File;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileResponse {
  statusCode: number;
  message: string;
  data: UserProfile;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) throw new Error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user data in localStorage");

      const { uid } = JSON.parse(userData);

      console.log(updatedProfile);

      if (
        updatedProfile.firstName ||
        updatedProfile.lastName ||
        updatedProfile.phoneNumber
      ) {
        const userInfoBody = {
          uid,
          firstName: updatedProfile.firstName || "",
          lastName: updatedProfile.lastName || "",
          phoneNumber: updatedProfile.phoneNumber || "",
          status: 0,
        };

        await axios.put<ProfileResponse>(
          "/proxy/Auth/EditUserInfoRequest",
          userInfoBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (updatedProfile.newPassword && updatedProfile.confirmPassword) {
        if (updatedProfile.newPassword !== updatedProfile.confirmPassword) {
          throw new Error("New password and confirmation do not match.");
        }

        const passwordBody = {
          uid,
          newPassword: updatedProfile.newPassword,
        };

        const passwordResponse = await axios.put<ProfileResponse>(
          "/proxy/Auth/ChangePassword",
          passwordBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        alert(passwordResponse.data.message);
      }

      if (updatedProfile.email) {
        const emailBody = {
          uid,
          email: updatedProfile.email,
        };

        const emailResponse = await axios.put<ProfileResponse>(
          "/proxy/Auth/ChangeEmail",
          emailBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        alert(emailResponse.data.message);
      }

      if (
        updatedProfile.profilePicture &&
        typeof updatedProfile.profilePicture !== "string"
      ) {
        const formData = new FormData();
        formData.append("profilePicture", updatedProfile.profilePicture);

        const profileResponse = await axios.post(
          "/proxy/Auth/UploadProfilePicture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        alert(profileResponse.data.message);

        const newProfilePicUrl = profileResponse.data.data.profilePicUrl;
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.profilePicture = newProfilePicUrl;

          localStorage.setItem("user", JSON.stringify(parsedUser));
        }

        window.location.reload();
      }

      return true;
    } catch (err: unknown) {
      let message = "Update failed";

      if (err && typeof err === "object" && "response" in err) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        message = error.response?.data?.message || error.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    setProfile,
  };
};
