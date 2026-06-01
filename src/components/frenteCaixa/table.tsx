import { formSchema } from "@/routes/_base";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TabelaFrenteCaixa({
  form,
  formData,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  formData: z.infer<typeof formSchema>["itens"];
}) {
  return (
    <div className="h-1/2 overflow-auto  rounded-md relative border-2 border-black print:h-max">
      <Table noWrapper>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="text-left ">SKU</TableHead>
            <TableHead className="text-left ">Nome</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right ">Quantidade</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right w-10 print:hidden">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-scroll ">
          {formData?.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.nome}</TableCell>
              <TableCell className="text-right">
                {item.preco.toFixed(2)}
              </TableCell>
              <TableCell className="text-center ">
                <Input
                  className="text-center flex w-16 ml-auto"
                  type="number"
                  value={item.quantity}
                  data-no-spinner
                  onChange={(e) => {
                    let value = Number(e.target.value);

                    if (Number.isNaN(value)) {
                      value = 0;
                    }

                    value = Math.max(0, Math.min(100, value));

                    e.target.value = value.toString();
                    form.setValue(
                      "itens",
                      form
                        .getValues("itens")
                        .map((i, idx) =>
                          idx === index ? { ...i, quantity: value } : i,
                        ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                />
              </TableCell>
              <TableCell className="text-right">
                {(item.preco * item.quantity).toFixed(2)}
              </TableCell>
              <TableCell className="flex justify-center print:hidden">
                <div
                  onClick={() => {
                    form.setValue(
                      "itens",
                      form.getValues("itens").filter((_, idx) => idx !== index),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }}
                >
                  <Trash color="red" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
