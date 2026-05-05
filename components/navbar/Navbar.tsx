import Container from "@/components/global/Container";
import Logo from "./Logo";
import NavSearch from "./NavSearch";
import CartButton from "./CartButton";
import LinksDropdown from "./LinksDropdown";

export default function Navbar() {
  return (
    <nav className="border-b">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Logo />
        <NavSearch />
        <div className="flex items-center gap-4">
          <CartButton />
          <LinksDropdown />
        </div>
      </Container>
    </nav>
  );
}
