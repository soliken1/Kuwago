//This is a server side component which is the parent layout. Build the components and stack it here here and refer to
//LoginLayout for a sample Layout

import React from "react";
import RegisterForm from "@/components/register/client/RegisterForm";

export default function RegisterLayout() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <RegisterForm />
    </div>
  );
}
