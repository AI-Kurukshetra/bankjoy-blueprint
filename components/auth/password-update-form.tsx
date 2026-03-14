"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordUpdateFormProps = {
  action: (formData: FormData) => void;
  disabled?: boolean;
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={disabled || pending} type="submit">
      {pending ? "Updating password..." : "Save new password"}
    </Button>
  );
}

export function PasswordUpdateForm({ action, disabled }: PasswordUpdateFormProps) {
  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2 text-sm text-muted">
        New password
        <Input name="password" placeholder="Minimum 8 characters" required type="password" />
      </label>
      <label className="block space-y-2 text-sm text-muted">
        Confirm password
        <Input name="confirmPassword" placeholder="Repeat your new password" required type="password" />
      </label>
      <SubmitButton disabled={disabled} />
    </form>
  );
}
