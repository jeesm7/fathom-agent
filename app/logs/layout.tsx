import { Navigation } from "@/components/navigation";

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navigation />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}

