import { InputFrentCaixa } from "@/components/frenteCaixa/input";
import { TabelaFrenteCaixa } from "@/components/frenteCaixa/table";
import { InfosFinais } from "@/components/frenteCaixa/infos";
import { db } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FinalizarVenda } from "@/components/frenteCaixa/finalizarVenda";
import { invoke } from "@tauri-apps/api/core";

export const formSchema = z.object({
  itens: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number(),
      preco: z.number(),
      nome: z.string(),
    }),
  ),
  desconto: z.number(),
});

const searchSchema = z.object({
  venda: z.string().optional(),
});

export const Route = createFileRoute("/_base/")({
  component: Index,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { venda } }) => ({ venda }),
  loader: async ({ deps: { venda } }) => {
    const produtos: Produtos[] = await db.select("SELECT * FROM produtos");

    let resgate: z.infer<typeof formSchema>[] | null = null;

    if (venda) {
      resgate = await db.select(
        `
        SELECT
            vendas.desconto,
            (
                SELECT json_group_array(
                    json_object(
                        'sku', itens_venda.produto_sku,
                        'quantity', itens_venda.quantidade,
                        'preco', produtos.preco,
                        'nome', produtos.nome
                    )
                )
                FROM itens_venda
                LEFT JOIN produtos
                    ON produtos.SKU = itens_venda.produto_sku
                WHERE itens_venda.venda_id = vendas.id
                  AND produtos.SKU IS NOT NULL
            ) AS itens
        FROM vendas
        WHERE vendas.id = $1;
        `,
        [venda],
      );

      if (resgate) {
        // @ts-ignore
        resgate[0].itens = JSON.parse(resgate[0].itens);
      }
    }
    if (!resgate) {
      resgate = [
        {
          desconto: 0,
          itens: [],
        },
      ];
    }
    return { produtos, resgate: resgate[0] };
  },
});

function Index() {
  const [open, setOpen] = useState(false);
  const [idVenda, setIdVenda] = useState<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const qtdRef = useRef<HTMLInputElement>(null);
  const descontoRef = useRef<HTMLInputElement>(null);

  const { produtos, resgate } = Route.useLoaderData();

  const { venda } = Route.useSearch();

  useEffect(() => {
    setIdVenda(venda);
  }, [venda]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: resgate,
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        qtdRef.current?.focus();
      }
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        descontoRef.current?.focus();
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!form.formState.isSubmitting) {
          console.log("Submitting form with keyboard shortcut");
          form.handleSubmit(onSubmit)();
        }
      }
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        form.reset({
          itens: [],
          desconto: 0,
        });
        setIdVenda(undefined);
      }
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        console.log("Printing with keyboard shortcut");
        e.preventDefault();
        window.print();
      }
    },
    [form, onSubmit],
  );

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setOpen(true);
    try {
      const response: InsertResponse = await invoke("process_sale", {
        items: JSON.stringify(data.itens),
        desconto: data.desconto,
        vendaId: idVenda ? parseInt(idVenda) : undefined,
      });
      setIdVenda(`${response.rows_updated}`);
    } catch (error) {
      alert("Falha ao processar a venda: " + error);
    }
    setOpen(false);
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const formData = useWatch({
    control: form.control,
    name: "itens",
    exact: true,
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col p-4 h-full gap-4 "
    >
      <h1 className="text-center text-2xl font-bold mt-4 print:hidden">
        Sistema de Frente de Caixa da GAIA -{" "}
        {idVenda ? `Venda #${idVenda}` : "Nova Venda"}
      </h1>
      <h1 className="text-center text-2xl font-bold mt-4 print:block hidden">
        Comprovante de Venda - {idVenda ? `Venda #${idVenda}` : "Nova Venda"}
      </h1>
      <div className="print:hidden">
        <InputFrentCaixa
          produtos={produtos}
          form={form}
          refInput={inputRef}
          refQtd={qtdRef}
        />
      </div>
      <TabelaFrenteCaixa form={form} formData={formData} />
      <InfosFinais formData={formData} form={form} descontoRef={descontoRef} />
      <div className="flex grow flex-1 w-full print:hidden">
        <FinalizarVenda open={open} setOpen={setOpen} reset={form.reset} />
      </div>
    </form>
  );
}
