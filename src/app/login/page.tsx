"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Welcome to Signal Hub</h1>
      <Button onClick={() => signIn("google", { callbackUrl: "/alerts" })}>
        Sign in with Google
      </Button>
    </div>
  );
}