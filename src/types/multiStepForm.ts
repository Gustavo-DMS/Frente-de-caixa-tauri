// types/multiStepForm.ts
import { z, ZodObject, ZodRawShape } from "zod";
import { FieldPath } from "react-hook-form";

export type FormStep<T extends ZodObject<ZodRawShape>> = {
  title: string;
  position: number;
  validationSchema: T;
  component: React.ReactElement;
  icon: any; // LucideIcon;
  fields: FieldPath<z.infer<T>>[];
};

export type MultiStepFormContextProps = {
  currentStep: FormStep<any>;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (position: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  steps: FormStep<any>[];
};
