"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = {
  action: (formData: FormData) => void;
  mode: "login" | "signup";
};

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit">
      {pending ? "Processing..." : mode === "signup" ? "Create account" : "Sign in"}
    </Button>
  );
}

export function AuthForm({ action, mode }: AuthFormProps) {
  return (
    <form action={action} className="space-y-4">
      {mode === "signup" ? (
        <label className="block space-y-2 text-sm text-muted">
          Full name
          <Input name="fullName" placeholder="Alex Johnson" required />
        </label>
      ) : null}
      <label className="block space-y-2 text-sm text-muted">
        Email
        <Input name="email" placeholder="you@example.com" required type="email" />
      </label>
      <label className="block space-y-2 text-sm text-muted">
        Password
        <Input name="password" placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"} required type="password" />
      </label>
      <SubmitButton mode={mode} />
    </form>
  );
}
