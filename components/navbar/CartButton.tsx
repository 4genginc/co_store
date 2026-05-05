import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BsCart3 } from "react-icons/bs";

const numItemsInCart = 9;

export default function CartButton() {
  return (
    <Link
      href="/cart"
      aria-label="cart"
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "relative"
      )}
    >
      <BsCart3 />
      <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs">
        {numItemsInCart}
      </span>
    </Link>
  );
}
