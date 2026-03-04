import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Vastrayug account and discover premium Indian clothing.",
};

export default function SignupPage() {
  return <SignupForm />;
}
