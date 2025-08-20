import { PartnerSidebar } from "./PartnerSidebar";
import { PartnerTopNavigation } from "./PartnerTopNavigation";

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PartnerTopNavigation />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}