import { ExerciseService } from '../exerciseService';

describe('ExerciseService', () => {
  it('returns mapped suggestions', async () => {
    const repo = {
      searchExercises: jest.fn().mockResolvedValue([
        { id: 'e1', name: 'Bench Press' },
        { id: 'e2', name: 'Back Squat' }
      ])
    };

    const service = new ExerciseService(repo as never);

    const suggestions = await service.getSuggestions('bench');

    expect(suggestions).toEqual([
      { id: 'e1', name: 'Bench Press' },
      { id: 'e2', name: 'Back Squat' }
    ]);
  });

  it('creates inline exercise and validates input', async () => {
    const repo = {
      createExercise: jest.fn().mockResolvedValue(undefined),
      updateExercise: jest.fn()
    };

    const service = new ExerciseService(repo as never);

    const created = await service.createInlineExercise('Cable Fly');
    expect(created.name).toBe('Cable Fly');
    expect(repo.createExercise).toHaveBeenCalledTimes(1);

    await expect(service.createInlineExercise('  ')).rejects.toThrow('Exercise name is required');
  });
});
