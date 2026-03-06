import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExerciseSuggestion, ExerciseSuggestionList } from '../components/ExerciseSuggestionList';
import { SetEntryRow } from '../components/SetEntryRow';
import { getExerciseService, getWorkoutService } from '../services/runtimeServices';
import { ExerciseService } from '../services/exerciseService';
import { WorkoutService } from '../services/workoutService';
import {
  DraftExercise,
  DraftSet,
  resetWorkoutDraft,
  updateWorkoutDraft,
  useWorkoutStore
} from '../state/useWorkoutStore';
import { validateSetInput } from '../utils/validation';

interface WorkoutSessionScreenProps {
  exerciseService?: ExerciseService;
  workoutService?: WorkoutService;
}

const createLocalId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const WorkoutSessionScreen = ({
  exerciseService: injectedExerciseService,
  workoutService: injectedWorkoutService
}: WorkoutSessionScreenProps): React.JSX.Element => {
  const [draft, setDraft] = useWorkoutStore();
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [services, setServices] = useState<{
    exerciseService: ExerciseService;
    workoutService: WorkoutService;
  } | null>(
    injectedExerciseService && injectedWorkoutService
      ? { exerciseService: injectedExerciseService, workoutService: injectedWorkoutService }
      : null
  );

  useEffect(() => {
    let isMounted = true;

    if (services || (injectedExerciseService && injectedWorkoutService)) {
      return;
    }

    Promise.all([getExerciseService(), getWorkoutService()])
      .then(([exerciseService, workoutService]) => {
        if (isMounted) {
          setServices({ exerciseService, workoutService });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(String(error));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [injectedExerciseService, injectedWorkoutService, services]);

  const activeServices = useMemo(
    () =>
      services ??
      (injectedExerciseService && injectedWorkoutService
        ? {
            exerciseService: injectedExerciseService,
            workoutService: injectedWorkoutService
          }
        : null),
    [injectedExerciseService, injectedWorkoutService, services]
  );

  const refreshSuggestions = useCallback(
    async (query: string): Promise<void> => {
      if (!activeServices) {
        return;
      }

      const nextSuggestions = await activeServices.exerciseService.getSuggestions(query);
      setSuggestions(nextSuggestions);
    },
    [activeServices]
  );

  useEffect(() => {
    refreshSuggestions(exerciseQuery).catch((error: unknown) => {
      setErrorMessage(String(error));
    });
  }, [exerciseQuery, refreshSuggestions]);

  const upsertDraftExercise = (exercise: DraftExercise): void => {
    const nextExercises = [...draft.exercises, exercise];
    setDraft({ ...draft, exercises: nextExercises });
  };

  const addExerciseFromSuggestion = (suggestion: ExerciseSuggestion): void => {
    if (draft.exercises.some((entry) => entry.exerciseId === suggestion.id)) {
      setExerciseQuery('');
      setSuggestions([]);
      return;
    }

    upsertDraftExercise({
      localId: createLocalId('draft_exercise'),
      exerciseId: suggestion.id,
      exerciseName: suggestion.name,
      sets: [{ id: createLocalId('draft_set'), weight: '', reps: '' }]
    });

    setExerciseQuery('');
    setSuggestions([]);
  };

  const createExerciseInline = async (name: string): Promise<void> => {
    if (!activeServices) {
      return;
    }

    try {
      const created = await activeServices.exerciseService.createInlineExercise(name);
      addExerciseFromSuggestion(created);
      await refreshSuggestions('');
    } catch (error: unknown) {
      setErrorMessage(String(error));
    }
  };

  const addSet = (exerciseLocalId: string): void => {
    const nextExercises = draft.exercises.map((entry) =>
      entry.localId === exerciseLocalId
        ? {
            ...entry,
            sets: [...entry.sets, { id: createLocalId('draft_set'), weight: '', reps: '' }]
          }
        : entry
    );

    setDraft({ ...draft, exercises: nextExercises });
  };

  const deleteSet = (exerciseLocalId: string, setId: string): void => {
    const nextExercises = draft.exercises
      .map((entry) =>
        entry.localId === exerciseLocalId
          ? {
              ...entry,
              sets: entry.sets.filter((setEntry) => setEntry.id !== setId)
            }
          : entry
      )
      .filter((entry) => entry.sets.length > 0);

    setDraft({ ...draft, exercises: nextExercises });
  };

  const updateSetField = (
    exerciseLocalId: string,
    setId: string,
    field: keyof Pick<DraftSet, 'weight' | 'reps'>,
    value: string
  ): void => {
    const nextExercises = draft.exercises.map((entry) => {
      if (entry.localId !== exerciseLocalId) {
        return entry;
      }

      return {
        ...entry,
        sets: entry.sets.map((setEntry) =>
          setEntry.id === setId
            ? {
                ...setEntry,
                [field]: value
              }
            : setEntry
        )
      };
    });

    setDraft({ ...draft, exercises: nextExercises });
  };

  const saveSession = async (): Promise<void> => {
    if (!activeServices) {
      return;
    }

    setErrorMessage(null);
    setSavedMessage(null);

    try {
      const sessionId = await activeServices.workoutService.persistSession({
        sessionId: draft.sessionId,
        startedAt: draft.startedAt,
        endedAt: new Date().toISOString(),
        exercises: draft.exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((setEntry) => ({
            weight: Number(setEntry.weight),
            reps: Number(setEntry.reps)
          }))
        }))
      });

      updateWorkoutDraft({ ...draft, sessionId });
      setSavedMessage('Workout saved');
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const validateInline = (setEntry: DraftSet): string | undefined => {
    if (!setEntry.weight || !setEntry.reps) {
      return undefined;
    }

    const error = validateSetInput(Number(setEntry.weight), Number(setEntry.reps));

    return error ?? undefined;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Workout Session</Text>

        <TextInput
          testID="exercise-query-input"
          value={exerciseQuery}
          onChangeText={setExerciseQuery}
          placeholder="Search or create exercise"
          style={styles.input}
        />

        <ExerciseSuggestionList
          query={exerciseQuery}
          suggestions={suggestions}
          onSelectSuggestion={addExerciseFromSuggestion}
          onCreateExercise={(name) => {
            void createExerciseInline(name);
          }}
        />

        {draft.exercises.map((exercise) => (
          <View key={exercise.localId} style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
            {exercise.sets.map((setEntry, index) => (
              <SetEntryRow
                key={setEntry.id}
                index={index}
                weight={setEntry.weight}
                reps={setEntry.reps}
                error={validateInline(setEntry)}
                onWeightChange={(value) => updateSetField(exercise.localId, setEntry.id, 'weight', value)}
                onRepsChange={(value) => updateSetField(exercise.localId, setEntry.id, 'reps', value)}
                onDelete={() => deleteSet(exercise.localId, setEntry.id)}
              />
            ))}

            <Pressable
              accessibilityRole="button"
              style={styles.addButton}
              onPress={() => addSet(exercise.localId)}
            >
              <Text>Add Set</Text>
            </Pressable>
          </View>
        ))}

        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => void saveSession()}>
          <Text style={styles.primaryButtonText}>Save Workout</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => {
            resetWorkoutDraft();
            setSavedMessage(null);
            setErrorMessage(null);
          }}
        >
          <Text>Reset Session</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 16,
    gap: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '700'
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    gap: 8
  },
  exerciseTitle: {
    fontWeight: '700',
    fontSize: 16
  },
  addButton: {
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start'
  },
  primaryButton: {
    backgroundColor: '#0c5f34',
    borderRadius: 8,
    padding: 12
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center'
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12
  },
  error: {
    color: '#b00020'
  },
  success: {
    color: '#0c5f34'
  }
});
