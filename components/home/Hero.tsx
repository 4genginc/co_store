import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import HeroCarousel from "./HeroCarousel";

export default function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div>
        <h1 className="max-w-2xl font-bold text-4xl tracking-tight sm:text-6xl">
          Software-defined radios, board-up.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
          Evaluation, replacement, and integration boards from the
          MicroEmbedded SDR catalog — designed for GNU Radio workflows,
          long-lived field systems, and anyone keeping legacy USRP-class
          deployments alive.
        </p>
        <Link
          href="/products"
          className={buttonVariants({ size: "lg", className: "mt-10" })}
        >
          Our Products
        </Link>
      </div>
      <HeroCarousel />
    </section>
  );
}
