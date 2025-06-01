"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
//Defining the expected payload to be sent on the API
interface LoginPayload {
  email: string;
  password: string;
}

//Defining what datatype is the fields on the response within the object from the API (e.g message: "Success", token: "sampletoken123")
interface LoginResponse {
  // Update this based on actual API response structure
  token?: string;
  message?: string;
}

interface UserData {
  uid: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  profilePicture?: string;
  role?: string;
  createdAt?: string;
  // Add other properties as needed
}

interface UserResponse {
  success?: string;
  message?: string;
  statusCode?: string;
  data?: UserData;
}

export default function useLoginRequest() {
  //Store the response and use the interface to expect what response object is it receiving
  const [loginData, setLoginData] = useState<LoginResponse | null>(null);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //Prepare payload to be sent when user presses login (e.g email and password to be handled on the backend if it exists or not)
  const login = async (payload: LoginPayload, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);

    //Await the actual response based on the payload (e.g message: "Success", "Failed", etc)
    try {
      const loginResponse = await axios.post<LoginResponse>(
        "/proxy/Auth/login",
        payload
      );
      setLoginData(loginResponse.data);
      const userResponse = await axios.get<UserResponse>("/proxy/Auth/GetUser");
      setUserData(userResponse.data);

      const userData = userResponse.data?.data;
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      onSuccess?.();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return { login, loginData, userData, loading, error };
}
