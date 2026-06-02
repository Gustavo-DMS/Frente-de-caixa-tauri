import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";

export const Route = createFileRoute("/_base/exportar/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button
        onClick={async () => {
          await invoke("exportar_vendas");
        }}
      >
        Exportar vendas
      </Button>
    </div>
  );
}
