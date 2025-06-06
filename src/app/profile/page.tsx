import React from "react";
import ProfileLayout from "@/layout/auth/ProfileLayout";
import ProfileForm from "@/components/profile/client/ProfileForm";

export default function Profile() {
  return (
    <ProfileLayout>
      <ProfileForm />
    </ProfileLayout>
  );
}
