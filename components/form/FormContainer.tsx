"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export type ActionState = {
  message: string;
  success?: boolean;
};

export const initialActionState: ActionState = { message: "" };

type FormContainerProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
};

export default function FormContainer({
  action,
  children,
  className,
}: FormContainerProps) {
  const [state, formAction] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.message === "") return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message, { duration: 10000 });
  }, [state]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
