export type WeightUnit = 'kg' | 'lb';

export interface WorkoutSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  exerciseIds: string[];
}

export interface Exercise {
  id: string;
  name: string;
  photoUri?: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseTag {
  id: string;
  name: string;
}

export interface ExerciseSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  loggedAt: string;
}

export interface WeightTrendPoint {
  exerciseId: string;
  date: string;
  weight: number;
  unit: WeightUnit;
}
