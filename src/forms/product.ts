import { z } from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Name is required",
    })
    .max(50),
  price: z.coerce.number().min(1000),
  categoryId: z.string(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
