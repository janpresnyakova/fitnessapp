import { initializeDatabase } from '../../migrations';
import { SqlJsTestClient } from '../../testUtils/sqlJsTestClient';
import { ExerciseRepository } from '../exerciseRepository';
import { WorkoutRepository } from '../workoutRepository';

describe('DB repositories', () => {
  it('supports exercise CRUD, suggestions, and tag linkage', async () => {
    const db = await SqlJsTestClient.create();
    await initializeDatabase(db);

    const exerciseRepository = new ExerciseRepository(db);

    await exerciseRepository.createExercise({
      id: 'e1',
      name: 'Bench Press',
      photoUri: 'file://bench.png',
      tagNames: ['Chest', 'Push'],
      createdAt: '2026-03-06T08:00:00.000Z',
      updatedAt: '2026-03-06T08:00:00.000Z'
    });

    await exerciseRepository.createExercise({
      id: 'e2',
      name: 'Incline Dumbbell Press',
      tagNames: ['Chest', 'Dumbbell'],
      createdAt: '2026-03-06T08:05:00.000Z',
      updatedAt: '2026-03-06T08:05:00.000Z'
    });

    const byId = await exerciseRepository.getExerciseById('e1');
    expect(byId?.photoUri).toBe('file://bench.png');
    expect(byId?.tags.map((tag) => tag.name)).toEqual(['Chest', 'Push']);

    const searchByPrefix = await exerciseRepository.searchExercises('Bench');
    expect(searchByPrefix.map((exercise) => exercise.id)).toEqual(['e1']);

    const searchByTag = await exerciseRepository.searchExercises('dumbbell');
    expect(searchByTag.map((exercise) => exercise.id)).toEqual(['e2']);

    await exerciseRepository.updateExercise({
      id: 'e1',
      name: 'Barbell Bench Press',
      photoUri: undefined,
      tagNames: ['Chest', 'Barbell'],
      updatedAt: '2026-03-06T09:00:00.000Z'
    });

    const updated = await exerciseRepository.getExerciseById('e1');
    expect(updated?.name).toBe('Barbell Bench Press');
    expect(updated?.photoUri).toBeUndefined();
    expect(updated?.tags.map((tag) => tag.name)).toEqual(['Barbell', 'Chest']);

    await db.close();
  });

  it('supports workout session CRUD and cascades set deletion', async () => {
    const db = await SqlJsTestClient.create();
    await initializeDatabase(db);

    const exerciseRepository = new ExerciseRepository(db);
    await exerciseRepository.createExercise({
      id: 'e1',
      name: 'Back Squat',
      createdAt: '2026-03-06T08:00:00.000Z',
      updatedAt: '2026-03-06T08:00:00.000Z'
    });

    const workoutRepository = new WorkoutRepository(db);

    await workoutRepository.createWorkoutSession({
      id: 's1',
      startedAt: '2026-03-06T10:00:00.000Z',
      endedAt: '2026-03-06T11:00:00.000Z',
      exercises: [
        {
          id: 'se1',
          exerciseId: 'e1',
          sets: [
            { id: 'set1', weight: 80, reps: 5 },
            { id: 'set2', weight: 85, reps: 3 }
          ]
        }
      ]
    });

    const detail = await workoutRepository.getWorkoutSessionDetail('s1');
    expect(detail?.session.exerciseIds).toEqual(['e1']);
    expect(detail?.exercises[0].sets.map((set) => set.weight)).toEqual([80, 85]);

    await workoutRepository.updateWorkoutSession({
      id: 's1',
      startedAt: '2026-03-06T10:05:00.000Z',
      endedAt: '2026-03-06T11:05:00.000Z',
      exercises: [
        {
          id: 'se2',
          exerciseId: 'e1',
          sets: [{ id: 'set3', weight: 90, reps: 2 }]
        }
      ]
    });

    const updated = await workoutRepository.getWorkoutSessionDetail('s1');
    expect(updated?.session.startedAt).toBe('2026-03-06T10:05:00.000Z');
    expect(updated?.exercises[0].sets).toHaveLength(1);
    expect(updated?.exercises[0].sets[0].id).toBe('set3');

    await workoutRepository.deleteWorkoutSession('s1');

    const list = await workoutRepository.listWorkoutSessions();
    expect(list).toHaveLength(0);

    await db.close();
  });

  it('enforces relational integrity constraints', async () => {
    const db = await SqlJsTestClient.create();
    await initializeDatabase(db);

    const exerciseRepository = new ExerciseRepository(db);
    await exerciseRepository.createExercise({
      id: 'e1',
      name: 'Deadlift',
      createdAt: '2026-03-06T08:00:00.000Z',
      updatedAt: '2026-03-06T08:00:00.000Z'
    });

    const workoutRepository = new WorkoutRepository(db);
    await workoutRepository.createWorkoutSession({
      id: 's1',
      startedAt: '2026-03-06T10:00:00.000Z',
      exercises: [
        {
          id: 'se1',
          exerciseId: 'e1',
          sets: [{ id: 'set1', weight: 120, reps: 5 }]
        }
      ]
    });

    await expect(exerciseRepository.deleteExercise('e1')).rejects.toThrow();

    await workoutRepository.deleteWorkoutSession('s1');
    await expect(exerciseRepository.deleteExercise('e1')).resolves.toBeUndefined();

    await db.close();
  });
});
