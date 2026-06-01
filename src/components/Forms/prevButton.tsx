// prevbutton.tsx
import { useMultiStepForm } from "@/hooks/form/steppedForm";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const PrevButton = ({
  onClick,
  type,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isFirstStep, previousStep } = useMultiStepForm();

  return (
    <button
      onClick={previousStep}
      disabled={isFirstStep}
      type="button"
      className={cn(
        "h-14 px-6 rounded-md flex items-center justify-center bg-accent text-white shadow-lg hover:bg-accentHover active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent transition",
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-2">
        <ArrowLeft />
        Anterior
      </div>
    </button>
  );
};
export default PrevButton;
