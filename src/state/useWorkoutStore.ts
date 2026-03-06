import { useEffect, useState } from 'react';

export interface DraftSet {
  id: string;
  weight: string;
  reps: string;
}

export interface DraftExercise {
  localId: string;
  exerciseId: string;
  exerciseName: string;
  sets: DraftSet[];
}

interface DraftWorkoutState {
  sessionId?: string;
  startedAt: string;
  exercises: DraftExercise[];
}

let currentState: DraftWorkoutState = {
  startedAt: new Date().toISOString(),
  exercises: []
};

const listeners = new Set<() => void>();

const emit = (): void => {
  listeners.forEach((listener) => listener());
};

export const updateWorkoutDraft = (state: DraftWorkoutState): void => {
  currentState = state;
  emit();
};

export const resetWorkoutDraft = (): void => {
  currentState = {
    startedAt: new Date().toISOString(),
    exercises: []
  };
  emit();
};

export const useWorkoutStore = (): [DraftWorkoutState, (next: DraftWorkoutState) => void] => {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    const listener = (): void => {
      setState(currentState);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return [state, updateWorkoutDraft];
};
