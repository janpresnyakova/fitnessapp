import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { WorkoutSessionScreen } from '../WorkoutSessionScreen';
import { resetWorkoutDraft } from '../../state/useWorkoutStore';

describe('WorkoutSessionScreen', () => {
  beforeEach(() => {
    resetWorkoutDraft();
  });

  it('adds exercise from suggestions and saves a valid workout', async () => {
    const getSuggestions = jest.fn().mockResolvedValue([{ id: 'e1', name: 'Bench Press' }]);
    const createInlineExercise = jest.fn();
    const persistSession = jest.fn().mockResolvedValue('session_1');

    const { getByTestId, getByText, findByText, getByLabelText } = render(
      <WorkoutSessionScreen
        exerciseService={{ getSuggestions, createInlineExercise } as never}
        workoutService={{ persistSession } as never}
      />
    );

    fireEvent.changeText(getByTestId('exercise-query-input'), 'bench');

    const suggestion = await findByText('Bench Press');
    fireEvent.press(suggestion);

    fireEvent.changeText(getByLabelText('Set 1 weight'), '100');
    fireEvent.changeText(getByLabelText('Set 1 reps'), '5');

    fireEvent.press(getByText('Save Workout'));

    await waitFor(() => {
      expect(persistSession).toHaveBeenCalledTimes(1);
    });

    expect(getByText('Workout saved')).toBeOnTheScreen();
  });

  it('shows inline validation error for invalid set values', async () => {
    const { getByTestId, findByText, getByLabelText } = render(
      <WorkoutSessionScreen
        exerciseService={{
          getSuggestions: jest.fn().mockResolvedValue([{ id: 'e1', name: 'Bench Press' }]),
          createInlineExercise: jest.fn()
        } as never}
        workoutService={{ persistSession: jest.fn() } as never}
      />
    );

    fireEvent.changeText(getByTestId('exercise-query-input'), 'bench');
    fireEvent.press(await findByText('Bench Press'));

    fireEvent.changeText(getByLabelText('Set 1 weight'), '-1');
    fireEvent.changeText(getByLabelText('Set 1 reps'), '5');

    expect(await findByText('Weight must be a positive number')).toBeOnTheScreen();
  });

  it('creates exercise inline when no match exists', async () => {
    const createInlineExercise = jest.fn().mockResolvedValue({ id: 'e9', name: 'Cable Fly' });

    const { getByTestId, findByText } = render(
      <WorkoutSessionScreen
        exerciseService={{
          getSuggestions: jest.fn().mockResolvedValue([]),
          createInlineExercise
        } as never}
        workoutService={{ persistSession: jest.fn().mockResolvedValue('session_1') } as never}
      />
    );

    fireEvent.changeText(getByTestId('exercise-query-input'), 'Cable Fly');
    fireEvent.press(await findByText('Create "Cable Fly"'));

    await waitFor(() => {
      expect(createInlineExercise).toHaveBeenCalledWith('Cable Fly');
    });

    expect(await findByText('Cable Fly')).toBeOnTheScreen();
  });
});
