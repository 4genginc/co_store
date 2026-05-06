import Link from "next/link";
import Image from "next/image";
import type { Product } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import FavoriteToggleButton from "./FavoriteToggleButton";

type ProductsGridProps = {
  products: Product[];
};

export default function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="pt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="group relative">
          <Link href={`/products/${product.id}`}>
            <Card className="transform group-hover:shadow-xl transition-shadow duration-500 pt-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-64 md:h-56 w-full bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-4"
                  />
                </div>
                <div className="px-4 pb-4 mt-2 text-center">
                  <h2 className="text-lg">{product.name}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {product.company}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <div className="absolute top-3 right-3 z-10">
            <FavoriteToggleButton productId={product.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
