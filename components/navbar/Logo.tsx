import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { VscCode } from "react-icons/vsc";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Next Store home"
      className={buttonVariants({ size: "icon" })}
    >
      <VscCode className="h-6 w-6" />
    </Link>
  );
}
