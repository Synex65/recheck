import { z } from "zod";

export const scanRequestSchema = z.object({
  storefrontUrl: z.string().min(1),
  moneyPages: z
    .object({
      home: z.string().optional(),
      plp: z.string().optional(),
      pdp: z.string().optional(),
      cart: z.string().optional(),
      checkout: z.string().optional(),
    })
    .optional(),
});
