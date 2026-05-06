import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-2">
        <Sidebar />
      </div>
      <div className="lg:col-span-10">{children}</div>
    </section>
  );
}
