import { validateExerciseName, validateSetInput } from '../validation';

describe('validation', () => {
  it('validates exercise name', () => {
    expect(validateExerciseName('Bench Press')).toBeNull();
    expect(validateExerciseName('   ')).toBe('Exercise name is required');
  });

  it('validates set input values', () => {
    expect(validateSetInput(50, 10)).toBeNull();
    expect(validateSetInput(-1, 10)).toBe('Weight must be a positive number');
    expect(validateSetInput(20, 0)).toBe('Reps must be a positive integer');
  });
});
