import {
  CreateWorkoutSessionInput,
  WorkoutRepository,
  WorkoutSessionExerciseInput
} from '../db/repositories/workoutRepository';
import { validateSetInput } from '../utils/validation';

export interface PersistableSetInput {
  id?: string;
  weight: number;
  reps: number;
}

export interface PersistableExerciseInput {
  id?: string;
  exerciseId: string;
  sets: PersistableSetInput[];
}

export interface PersistWorkoutSessionInput {
  sessionId?: string;
  startedAt: string;
  endedAt?: string;
  exercises: PersistableExerciseInput[];
}

const createId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export class WorkoutService {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  async persistSession(input: PersistWorkoutSessionInput): Promise<string> {
    if (input.exercises.length === 0) {
      throw new Error('Workout must contain at least one exercise');
    }

    const mappedExercises: WorkoutSessionExerciseInput[] = input.exercises.map((exercise) => {
      if (exercise.sets.length === 0) {
        throw new Error('Each exercise must contain at least one set');
      }

      return {
        id: exercise.id ?? createId('session_exercise'),
        exerciseId: exercise.exerciseId,
        sets: exercise.sets.map((set) => {
          const validationError = validateSetInput(set.weight, set.reps);

          if (validationError) {
            throw new Error(validationError);
          }

          return {
            id: set.id ?? createId('set'),
            weight: set.weight,
            reps: set.reps
          };
        })
      };
    });

    const sessionId = input.sessionId ?? createId('session');
    const payload: CreateWorkoutSessionInput = {
      id: sessionId,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      exercises: mappedExercises
    };

    const existing = await this.workoutRepository.getWorkoutSessionDetail(sessionId);

    if (existing) {
      await this.workoutRepository.updateWorkoutSession(payload);
    } else {
      await this.workoutRepository.createWorkoutSession(payload);
    }

    return sessionId;
  }
}
