import { useState, createContext } from "react";
import {
  FormProvider,
  useForm,
  FieldPath,
  UseFormProps,
} from "react-hook-form";
import { ZodObject, ZodRawShape, z } from "zod";
import { FormStep } from "@/types/multiStepForm";
import ProgressIndicator from "./progessIndicator";
import { typedZodResolver } from "./utils";

export const MultiStepFormContext = createContext<any>(null);

type MultiStepFormProps<
  CombinedSchema extends ZodObject<ZodRawShape>,
  Steps extends FormStep<any>[],
> = {
  steps: Steps;
  combinedSchema: CombinedSchema;
  onSubmit?: (data: z.infer<CombinedSchema>) => void | Promise<void>;
  formOptions?: UseFormProps<z.infer<CombinedSchema>>;
};

export function MultiStepForm<
  CombinedSchema extends ZodObject<ZodRawShape>,
  Steps extends FormStep<any>[],
>({
  steps,
  combinedSchema,
  onSubmit,
  formOptions,
}: MultiStepFormProps<CombinedSchema, Steps>) {
  type FormValues = z.infer<CombinedSchema>;

  const methods = useForm<FormValues>({
    resolver: typedZodResolver(combinedSchema),
    ...formOptions,
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  const nextStep = async () => {
    const isValid = await methods.trigger(
      currentStep.fields as FieldPath<FormValues>[],
    );
    console.log("isValid", methods.formState.errors);
    console.log(methods.getValues());

    if (!isValid) return;

    const stepValues = methods.getValues(
      currentStep.fields as FieldPath<FormValues>[],
    );
    const formValues = Object.fromEntries(
      currentStep.fields.map((field, i) => [field, stepValues[i] ?? ""]),
    );

    const result = currentStep.validationSchema.safeParse(formValues);

    if (!result.success) {
      result.error.issues.forEach((issue: z.core.$ZodIssue) => {
        if (issue.path.length > 0) {
          const path = issue.path.join(".") as FieldPath<FormValues>;
          methods.setError(path, { type: "manual", message: issue.message });
        }
      });
      return;
    }

    if (currentStepIndex < steps.length - 1) setCurrentStepIndex((i) => i + 1);
  };

  const previousStep = () => setCurrentStepIndex((i) => Math.max(i - 1, 0));

  const goToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentStepIndex(index - 1);
  };

  const submitSteppedForm = async (data: FormValues) => {
    if (onSubmit) await onSubmit(data);
  };

  return (
    <MultiStepFormContext.Provider
      value={{
        currentStep,
        currentStepIndex,
        nextStep,
        previousStep,
        steps,
        goToStep,
      }}
    >
      <FormProvider {...methods}>
        <div className="w-137.5 mx-auto p-8 rounded-lg shadow-lg ">
          <ProgressIndicator steps={steps} />
          <form onSubmit={methods.handleSubmit(submitSteppedForm)}>
            <h1 className="text-3xl font-bold">{currentStep.title}</h1>
            {currentStep.component}
          </form>
        </div>
      </FormProvider>
    </MultiStepFormContext.Provider>
  );
}

export default MultiStepForm;
