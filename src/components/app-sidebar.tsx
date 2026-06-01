import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";

const projects = [
  {
    name: "Frente de caixa",
    url: "/",
    icon: ChevronDown,
  },
  {
    name: "Cadastro de produtos",
    url: "/onboarding",
    icon: ChevronDown,
  },
  {
    name: "Resgate",
    url: "/resgate",
    icon: ChevronDown,
  },
  {
    name: "Exportar",
    url: "/exportar",
    icon: ChevronDown,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem></SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project.name}>
                <SidebarMenuButton
                  render={
                    <a href={project.url}>
                      <project.icon />
                      <span>{project.name}</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
