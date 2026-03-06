import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface SetEntryRowProps {
  index: number;
  weight: string;
  reps: string;
  error?: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onDelete: () => void;
}

export const SetEntryRow = ({
  index,
  weight,
  reps,
  error,
  onWeightChange,
  onRepsChange,
  onDelete
}: SetEntryRowProps): React.JSX.Element => (
  <View style={styles.row}>
    <Text style={styles.label}>{`Set ${index + 1}`}</Text>
    <TextInput
      accessibilityLabel={`Set ${index + 1} weight`}
      style={styles.input}
      value={weight}
      onChangeText={onWeightChange}
      keyboardType="decimal-pad"
      placeholder="Weight"
    />
    <TextInput
      accessibilityLabel={`Set ${index + 1} reps`}
      style={styles.input}
      value={reps}
      onChangeText={onRepsChange}
      keyboardType="number-pad"
      placeholder="Reps"
    />
    <Pressable accessibilityRole="button" style={styles.deleteButton} onPress={onDelete}>
      <Text>Delete</Text>
    </Pressable>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    gap: 6
  },
  label: {
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  deleteButton: {
    backgroundColor: '#f7d7d7',
    borderRadius: 6,
    padding: 8,
    alignSelf: 'flex-start'
  },
  error: {
    color: '#b00020'
  }
});
