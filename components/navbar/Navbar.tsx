import Container from "@/components/global/Container";

export default function Navbar() {
  return (
    <nav className="border-b py-4">
      <Container className="flex items-center justify-between">
        <span className="text-xl font-bold">Next Store</span>
      </Container>
    </nav>
  );
}
