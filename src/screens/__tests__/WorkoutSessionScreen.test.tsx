import React from 'react';
import { render } from '@testing-library/react-native';
import { WorkoutSessionScreen } from '../WorkoutSessionScreen';

describe('WorkoutSessionScreen', () => {
  it('renders title text', () => {
    const { getByText } = render(<WorkoutSessionScreen />);

    expect(getByText('Workout Session')).toBeOnTheScreen();
  });
});
