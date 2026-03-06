import { WorkoutService } from '../workoutService';

describe('WorkoutService', () => {
  it('creates a new session when one does not exist', async () => {
    const repo = {
      getWorkoutSessionDetail: jest.fn().mockResolvedValue(null),
      createWorkoutSession: jest.fn().mockResolvedValue(undefined),
      updateWorkoutSession: jest.fn().mockResolvedValue(undefined)
    };

    const service = new WorkoutService(repo as never);

    const sessionId = await service.persistSession({
      startedAt: '2026-03-06T10:00:00.000Z',
      exercises: [{ exerciseId: 'e1', sets: [{ weight: 60, reps: 8 }] }]
    });

    expect(sessionId).toBeTruthy();
    expect(repo.createWorkoutSession).toHaveBeenCalledTimes(1);
    expect(repo.updateWorkoutSession).not.toHaveBeenCalled();
  });

  it('updates an existing session when sessionId exists', async () => {
    const repo = {
      getWorkoutSessionDetail: jest.fn().mockResolvedValue({ session: { id: 's1' } }),
      createWorkoutSession: jest.fn().mockResolvedValue(undefined),
      updateWorkoutSession: jest.fn().mockResolvedValue(undefined)
    };

    const service = new WorkoutService(repo as never);

    await service.persistSession({
      sessionId: 's1',
      startedAt: '2026-03-06T10:00:00.000Z',
      exercises: [{ exerciseId: 'e1', sets: [{ weight: 60, reps: 8 }] }]
    });

    expect(repo.updateWorkoutSession).toHaveBeenCalledTimes(1);
    expect(repo.createWorkoutSession).not.toHaveBeenCalled();
  });

  it('throws when set values are invalid', async () => {
    const repo = {
      getWorkoutSessionDetail: jest.fn(),
      createWorkoutSession: jest.fn(),
      updateWorkoutSession: jest.fn()
    };

    const service = new WorkoutService(repo as never);

    await expect(
      service.persistSession({
        startedAt: '2026-03-06T10:00:00.000Z',
        exercises: [{ exerciseId: 'e1', sets: [{ weight: -10, reps: 8 }] }]
      })
    ).rejects.toThrow('Weight must be a positive number');
  });
});
