import Link from "next/link";

type BreadCrumbsProps = {
  name: string;
};

export default function BreadCrumbs({ name }: BreadCrumbsProps) {
  return (
    <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex items-center gap-x-2">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
        </li>
        <li>/</li>
        <li className="text-foreground">{name}</li>
      </ol>
    </nav>
  );
}
