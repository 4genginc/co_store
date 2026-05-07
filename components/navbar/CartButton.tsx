import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BsCart3 } from "react-icons/bs";
import { fetchCartItemCount } from "@/utils/queries";

export default async function CartButton() {
  const count = await fetchCartItemCount();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `cart, ${count} items` : "cart"}
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "relative"
      )}
    >
      <BsCart3 />
      {count > 0 && (
        <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs">
          {count}
        </span>
      )}
    </Link>
  );
}
