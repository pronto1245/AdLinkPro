import { PartnerSidebar } from "./PartnerSidebar";

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <PartnerSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}