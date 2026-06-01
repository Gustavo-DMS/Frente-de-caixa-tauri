import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export const Route = createFileRoute("/onboarding/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  return (
    <div className="p-2 flex h-svh">
      <Card className="m-auto w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="text-center">
            Bem vindo as Sistema de Frente de caixa da GAIA!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Para podermos começar a usar o programa vamos precisar de algumas
            coisas de você!
          </p>
          <p>
            <br />O primeiro passo é importar os produtos que vão ser vendidos.
            Para isso é necessario que você tenha um arquivo CSV com os
            seguintes campos:
            <ul className="list-disc list-inside px-3">
              <li>nome</li> <li>SKU</li> <li>quantidade</li>
            </ul>
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={async () => {
              const file = await open({
                multiple: false,
                directory: false,
              });
              if (!file) return;
              const data: { status: boolean; rows_updated: string } | string =
                await invoke("insert_produtos", {
                  csvPath: file,
                });
              if (typeof data === "object") {
                alert(`${data.rows_updated} Produtos importados com sucesso!`);
                navigate({ to: "/" });
              } else {
                alert("Erro ao importar produtos!");
              }
            }}
          >
            Upload CSV
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
