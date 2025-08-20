import { Navigation } from "@/components/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navigation for public pages */}
      <Navigation currentPage="home" />

      {/* Main Content */}
      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 border-t border-doser-border mt-16">
        <div className="container mx-auto px-6 py-8">
          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-doser-text-muted text-sm">© 2025 Doser.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
