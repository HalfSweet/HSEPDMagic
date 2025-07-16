import { AppNavbar } from "@/components/app-navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <AppNavbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
