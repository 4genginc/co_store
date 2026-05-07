import { fetchUserFavorites } from "@/utils/queries";
import SectionTitle from "@/components/global/SectionTitle";
import EmptyList from "@/components/global/EmptyList";
import ProductsGrid from "@/components/products/ProductsGrid";

export default async function FavoritesPage() {
  const favorites = await fetchUserFavorites();
  const products = favorites.map((favorite) => favorite.product);

  return (
    <section>
      <SectionTitle text="your favorites" />
      {products.length === 0 ? (
        <EmptyList
          heading="You haven't favorited any products yet."
          className="mt-12"
        />
      ) : (
        <ProductsGrid products={products} />
      )}
    </section>
  );
}
