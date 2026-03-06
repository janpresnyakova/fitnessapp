import { createSQLiteClient } from '../db/database';
import { ExerciseRepository } from '../db/repositories/exerciseRepository';
import { WorkoutRepository } from '../db/repositories/workoutRepository';
import { ExerciseService } from './exerciseService';
import { WorkoutService } from './workoutService';

let exerciseServicePromise: Promise<ExerciseService> | null = null;
let workoutServicePromise: Promise<WorkoutService> | null = null;

export const getExerciseService = async (): Promise<ExerciseService> => {
  if (!exerciseServicePromise) {
    exerciseServicePromise = createSQLiteClient().then((db) => new ExerciseService(new ExerciseRepository(db)));
  }

  return exerciseServicePromise;
};

export const getWorkoutService = async (): Promise<WorkoutService> => {
  if (!workoutServicePromise) {
    workoutServicePromise = createSQLiteClient().then((db) => new WorkoutService(new WorkoutRepository(db)));
  }

  return workoutServicePromise;
};
