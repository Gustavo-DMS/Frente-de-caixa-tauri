import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { formSchema } from "@/routes/_base";
import { UseFormReturn } from "react-hook-form";

export function InfosFinais({
  formData,
  form,
  descontoRef,
}: {
  formData: z.infer<typeof formSchema>["itens"];
  form: UseFormReturn<z.infer<typeof formSchema>>;
  descontoRef: React.Ref<HTMLInputElement>;
}) {
  const descontoValue = form.watch("desconto");
  const {
    ref: descontoRegisterRef,
    onChange,
    ...descontoField
  } = form.register("desconto", {
    valueAsNumber: true,
  });
  return (
    <div className="flex justify-end mt-4 gap-4">
      <div>
        <Label htmlFor="desconto" className="block">
          Desconto:
        </Label>
        <Input
          id="desconto"
          type="number"
          step="0.01"
          min="0"
          max="100"
          {...descontoField}
          ref={(el) => {
            descontoRegisterRef(el);
            // @ts-ignore
            descontoRef.current = el;
          }}
          className="border p-2 rounded w-full"
          onChange={(e) => {
            let value = Number(e.target.value);

            if (Number.isNaN(value)) {
              value = 0;
            }

            value = Math.max(0, Math.min(100, value));

            e.target.value = value.toString();

            onChange(e);
          }}
        />
      </div>
      <div>
        <Label className="block">Total:</Label>
        <Input
          className="text-xl font-bold"
          value={(
            formData?.reduce(
              (acc, item) => acc + item.preco * item.quantity,
              0,
            ) *
            (1 - descontoValue / 100)
          ).toFixed(2)}
        />
      </div>
      <div>
        <Label className="block">Itens:</Label>
        <Input
          className="text-xl font-bold"
          value={formData?.reduce((acc, item) => acc + item.quantity, 0)}
        />
      </div>
    </div>
  );
}
