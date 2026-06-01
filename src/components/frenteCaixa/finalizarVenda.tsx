import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "@tanstack/react-router";

export function FinalizarVenda({
  open,
  setOpen,
  reset,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  reset: (values: any) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col grow gap-4 print:hidden h-full">
      <div className="flex justify-between">
        <Button
          type="button"
          className="bg-green-500 text-white p-2 rounded-lg flex h-10 "
          onClick={() => {
            window.print();
          }}
        >
          Imprimir Comprovante (Ctrl + P)
        </Button>

        <Dialog open={open} onOpenChange={setOpen} disablePointerDismissal>
          <Button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-lg flex h-10 "
          >
            SALVAR VENDA (Ctrl + Enter)
          </Button>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Salvando sua venda!</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <Spinner className="size-15" />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Button
        type="button"
        className="bg-green-500 text-white p-2 rounded-lg flex h-10 mb-0 mt-auto text-lg"
        onClick={() => {
          reset({
            itens: [],
            desconto: 0,
          });
          navigate({
            to: "/",
            search: {
              venda: undefined,
            },
          });
        }}
      >
        NOVA VENDA (Ctrl + N)
      </Button>
    </div>
  );
}
