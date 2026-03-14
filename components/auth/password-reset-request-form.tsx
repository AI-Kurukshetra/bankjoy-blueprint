"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordResetRequestFormProps = {
  action: (formData: FormData) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit">
      {pending ? "Sending link..." : "Send reset link"}
    </Button>
  );
}

export function PasswordResetRequestForm({ action }: PasswordResetRequestFormProps) {
  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2 text-sm text-muted">
        Email
        <Input name="email" placeholder="you@example.com" required type="email" />
      </label>
      <SubmitButton />
    </form>
  );
}
