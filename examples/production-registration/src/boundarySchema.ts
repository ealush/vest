import { z } from 'zod';

export const registrationBoundarySchema = z
  .object({
    accountType: z.enum(['personal', 'business']),
    companyName: z.string(),
    confirmPassword: z.string(),
    email: z
      .string()
      .trim()
      .email()
      .transform(value => value.toLowerCase()),
    marketingOptIn: z.boolean(),
    password: z.string().min(10),
    username: z.string().min(3),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }

    if (data.accountType === 'business' && !data.companyName.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Company name is required for business accounts',
        path: ['companyName'],
      });
    }
  })
  .transform(data => ({
    ...data,
    companyName: data.companyName.trim(),
    email: data.email.trim().toLowerCase(),
    username: data.username.trim(),
  }));

export type RegistrationPayload = z.output<typeof registrationBoundarySchema>;
