import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/lib/utils";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <TooltipProvider>
      <Outlet />
    </TooltipProvider>
    <div className="print:hidden">
      <TanStackRouterDevtools />
    </div>
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/onboarding") return;

    const dbUsers = await db.select<Onboarding[]>("SELECT * FROM onboarding");
    if (dbUsers[0].completed == true) return;
    throw redirect({
      to: "/onboarding",
      search: {
        redirect: "/",
      },
    });
  },
});
