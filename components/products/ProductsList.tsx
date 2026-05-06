import Link from "next/link";
import Image from "next/image";
import type { Product } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";
import FavoriteToggleButton from "./FavoriteToggleButton";

type ProductsListProps = {
  products: Product[];
};

export default function ProductsList({ products }: ProductsListProps) {
  return (
    <div className="mt-12 grid gap-y-6">
      {products.map((product) => (
        <article key={product.id} className="group relative">
          <Link href={`/products/${product.id}`}>
            <Card className="transform group-hover:shadow-xl transition-shadow duration-500 pt-0 overflow-hidden">
              <CardContent className="p-4 grid md:grid-cols-3 gap-y-4 items-center">
                <div className="relative h-48 md:h-40 md:w-40 w-full bg-muted rounded">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <h2 className="text-xl">{product.name}</h2>
                  <h4 className="text-muted-foreground text-sm">
                    {product.company}
                  </h4>
                </div>
                <p className="text-muted-foreground text-lg md:justify-self-end md:pr-12">
                  {formatCurrency(product.price)}
                </p>
              </CardContent>
            </Card>
          </Link>
          <div className="absolute bottom-4 right-4 z-10">
            <FavoriteToggleButton productId={product.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
