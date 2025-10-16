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

interface TokenData {
  firebase_token: string;
}

interface ProfileResponse {
  statusCode: number;
  message: string;
  data: UserProfile;
}

interface TokenResponse {
  statusCode: number;
  message: string;
  data: TokenData;
  status: boolean;
}

interface EmailChangeResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    user: {
      uid: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      role: number;
      status: number;
      createdAt: string;
    };
    verificationLink: string;
  };
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

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get("/proxy/Auth/GetUserLoggedInInfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        
        // Update profile state with fetched data
        setProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          profilePicture: userData.profilePicture || "",
          newPassword: "",
          confirmPassword: "",
        });

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err: unknown) {
      let message = "Failed to fetch user data";
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    updatedProfile: Partial<UserProfile>
  ): Promise<true | false | EmailChangeResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie("session_token");
      if (!token) throw new Error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user data in localStorage");

      const { uid } = JSON.parse(userData);

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
        const tokenResponse = await axios.get<TokenResponse>(
          "/proxy/Auth/CheckToken",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const firebaseToken = tokenResponse?.data.data.firebase_token;
        const emailBody = {
          newEmail: updatedProfile.email,
          firebaseToken: firebaseToken,
        };

        const emailResponse = await axios.put<EmailChangeResponse>(
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

        return emailResponse.data;
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
        return true;
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
    fetchUserData,
  };
};
