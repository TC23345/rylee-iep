import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { requireSignedInUser } from "@/lib/authz";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSignedInUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Topbar />
          <UserButton />
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
