import { useMultiStepForm } from "@/hooks/form/steppedForm";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// nextbutton.tsx
export const NextButton = ({
  onClick,
  type,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLastStep } = useMultiStepForm();

  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={cn(
        "h-14 px-6 rounded-md flex items-center justify-center bg-accent text-white shadow-lg hover:bg-accentHover active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent transition",
        className,
      )}
      {...rest}
    >
      {isLastStep ? (
        "Enviar"
      ) : (
        <div className="flex items-center gap-2">
          Próximo
          <ArrowRight />
        </div>
      )}
    </button>
  );
};
