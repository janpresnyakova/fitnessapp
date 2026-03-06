import { z } from 'zod';

const weightSchema = z.number().positive('Weight must be a positive number');
const repsSchema = z.number().int('Reps must be an integer').positive('Reps must be a positive integer');

export const exerciseNameSchema = z
  .string()
  .trim()
  .min(1, 'Exercise name is required');

export const setInputSchema = z.object({
  weight: weightSchema,
  reps: repsSchema
});

export const validateExerciseName = (value: string): string | null => {
  const result = exerciseNameSchema.safeParse(value);

  return result.success ? null : result.error.issues[0]?.message ?? 'Invalid exercise name';
};

export const validateSetInput = (weight: number, reps: number): string | null => {
  const result = setInputSchema.safeParse({ weight, reps });

  return result.success ? null : result.error.issues[0]?.message ?? 'Invalid set values';
};
