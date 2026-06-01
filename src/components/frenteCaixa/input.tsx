import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formSchema } from "@/routes/_base";
import { z } from "zod";
import { useState } from "react";

export function InputFrentCaixa({
  produtos,
  form,
  refInput,
  refQtd,
}: {
  produtos: Produtos[];
  form: UseFormReturn<z.infer<typeof formSchema>>;
  refInput: React.Ref<HTMLInputElement>;
  refQtd: React.Ref<HTMLInputElement>;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="flex gap-2">
      <span className="flex flex-col grow gap-2">
        <Label htmlFor="sku">SKU:</Label>
        <Input
          id="sku"
          ref={refInput}
          placeholder="Código Produto"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value;
              const produto = produtos.find(
                (p) => p.SKU.toLowerCase() === value.toLowerCase(),
              );
              console.log(produto);
              console.log(value.toLowerCase());
              if (produto) {
                const existing = form
                  .getValues("itens")
                  ?.find(
                    (item) =>
                      item.sku.toLowerCase() === produto.SKU.toLowerCase(),
                  );

                const item = {
                  sku: produto.SKU,
                  nome: produto.nome,
                  preco: produto.preco,
                  quantity: (existing?.quantity || 0) + quantity,
                };
                console.log(item);
                form.setValue(
                  "itens",
                  [
                    ...(form.getValues("itens") || []).filter(
                      (i) => i.sku.toLowerCase() !== produto.SKU.toLowerCase(),
                    ),
                    item,
                  ],
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                );

                e.currentTarget.value = "";
              } else {
                alert("Produto não encontrado");
              }
            }
          }}
        />
      </span>
      <span className="flex flex-col gap-2">
        <Label htmlFor="qtd" className="justify-center">
          QTD:
        </Label>
        <Input
          id="qtd"
          className="w-20"
          ref={refQtd}
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </span>
    </div>
  );
}
