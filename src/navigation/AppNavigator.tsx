import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExerciseEditorScreen } from '../screens/ExerciseEditorScreen';
import { ExerciseLibraryScreen } from '../screens/ExerciseLibraryScreen';
import { ExerciseStatsScreen } from '../screens/ExerciseStatsScreen';
import { WorkoutDetailScreen } from '../screens/WorkoutDetailScreen';
import { WorkoutHistoryScreen } from '../screens/WorkoutHistoryScreen';
import { WorkoutSessionScreen } from '../screens/WorkoutSessionScreen';

export type RootStackParamList = {
  WorkoutSession: undefined;
  WorkoutHistory: undefined;
  WorkoutDetail: { sessionId: string };
  ExerciseLibrary: undefined;
  ExerciseEditor: { exerciseId?: string } | undefined;
  ExerciseStats: { exerciseId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = (): React.JSX.Element => (
  <Stack.Navigator initialRouteName="WorkoutSession">
    <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} options={{ title: 'Log Workout' }} />
    <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: 'History' }} />
    <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: 'Workout Detail' }} />
    <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ title: 'Exercises' }} />
    <Stack.Screen name="ExerciseEditor" component={ExerciseEditorScreen} options={{ title: 'Edit Exercise' }} />
    <Stack.Screen name="ExerciseStats" component={ExerciseStatsScreen} options={{ title: 'Exercise Stats' }} />
  </Stack.Navigator>
);
