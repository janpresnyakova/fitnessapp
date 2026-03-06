import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ExerciseEditorScreen } from '../ExerciseEditorScreen';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: undefined })
}));

describe('ExerciseEditorScreen', () => {
  it('shows validation error when exercise name is empty', async () => {
    const { getByText, findByText } = render(
      <ExerciseEditorScreen exerciseService={{ upsertExercise: jest.fn() } as never} />
    );

    fireEvent.press(getByText('Save Exercise'));

    expect(await findByText('Exercise name is required')).toBeOnTheScreen();
  });

  it('saves exercise with optional photo and tags', async () => {
    const upsertExercise = jest.fn().mockResolvedValue('e1');

    const { getByTestId, getByText } = render(
      <ExerciseEditorScreen
        exerciseService={{ upsertExercise } as never}
        pickImageFromLibrary={jest.fn().mockResolvedValue('file://photo.jpg')}
      />
    );

    fireEvent.changeText(getByTestId('exercise-name-input'), 'Romanian Deadlift');
    fireEvent.changeText(getByTestId('exercise-tags-input'), 'posterior chain,hinge');

    fireEvent.press(getByText('Pick from Gallery'));
    await waitFor(() => {
      expect(getByText('Photo: file://photo.jpg')).toBeOnTheScreen();
    });

    fireEvent.press(getByText('Save Exercise'));

    await waitFor(() => {
      expect(upsertExercise).toHaveBeenCalledWith({
        id: undefined,
        name: 'Romanian Deadlift',
        tagNames: ['posterior chain', 'hinge'],
        photoUri: 'file://photo.jpg'
      });
    });
  });
});
