import { FieldPath, Resolver } from "react-hook-form";
import { z, ZodObject, ZodRawShape, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const typedZodResolver = <T extends ZodType<any, any, any>>(
  schema: T,
): Resolver<z.infer<T>> =>
  zodResolver(schema as unknown as ZodType<any, any, any>);

export const getFieldsFromSchema = <T extends ZodObject<ZodRawShape>>(
  schema: T,
): FieldPath<z.infer<T>>[] =>
  Object.keys(schema.shape) as FieldPath<z.infer<T>>[];
