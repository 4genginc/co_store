import { fetchFeaturedProducts } from "@/utils/actions";
import EmptyList from "@/components/global/EmptyList";
import SectionTitle from "@/components/global/SectionTitle";
import ProductsGrid from "@/components/products/ProductsGrid";

export default async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();
  return (
    <section className="pt-24">
      <SectionTitle text="featured products" />
      {products.length === 0 ? (
        <EmptyList heading="No featured products yet." className="mt-12" />
      ) : (
        <ProductsGrid products={products} />
      )}
    </section>
  );
}
