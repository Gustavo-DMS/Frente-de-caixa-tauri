import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const RootLayout = () => (
  <div className="h-svh flex ">
    <SidebarProvider>
      <div className="print:hidden">
        <AppSidebar />
      </div>
      <SidebarTrigger className="print:hidden" />
      <div className="flex-1">
        <Outlet />
      </div>
    </SidebarProvider>
  </div>
);

export const Route = createRootRoute({
  component: RootLayout,
});
