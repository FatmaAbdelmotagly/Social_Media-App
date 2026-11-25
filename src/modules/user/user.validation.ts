
import z from 'zod'
export const searchUsers = () => {
  return z.object({
    query: z.strictObject({
      keyword: z
        .string()
        .trim()
        .min(1, "keyword is required")
        .max(50, "keyword must not exceed 50 characters")
        .regex(
          /^[a-zA-Z\s]+$/,
          "keyword must contain letters only"
        ),
    }),
  });
};