"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import {
  removeCartItemAction,
  updateCartItemAmountAction,
} from "@/utils/actions";

const MAX_AMOUNT = 10;

type ThirdColumnProps = {
  cartItemId: string;
  amount: number;
  unitPrice: number;
};

// Right-side column of a cart row: amount selector, line subtotal, and
// remove button. Both controls funnel through useTransition so the row
// disables while the server action is in flight; revalidatePath in the
// action repaints the row + totals when it returns.
export default function ThirdColumn({
  cartItemId,
  amount,
  unitPrice,
}: ThirdColumnProps) {
  const [pending, startTransition] = useTransition();

  const onAmountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    const fd = new FormData();
    fd.set("cartItemId", cartItemId);
    fd.set("amount", String(next));
    startTransition(() => {
      updateCartItemAmountAction(fd);
    });
  };

  const onRemove = () => {
    const fd = new FormData();
    fd.set("cartItemId", cartItemId);
    startTransition(() => {
      removeCartItemAction(fd);
    });
  };

  return (
    <div className="flex flex-col items-end gap-y-2">
      <div className="flex items-center gap-x-2">
        <label htmlFor={`amount-${cartItemId}`} className="text-sm capitalize">
          amount
        </label>
        <select
          id={`amount-${cartItemId}`}
          value={amount}
          onChange={onAmountChange}
          disabled={pending}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {Array.from({ length: MAX_AMOUNT }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <p className="text-base font-medium">{formatCurrency(unitPrice * amount)}</p>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onRemove}
        disabled={pending}
        aria-label="remove from cart"
        className="text-muted-foreground hover:text-destructive"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <Trash2 className="size-4 mr-1" />
            <span className="capitalize">remove</span>
          </>
        )}
      </Button>
    </div>
  );
}
