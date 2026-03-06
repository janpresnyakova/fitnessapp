import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ExerciseSuggestion {
  id: string;
  name: string;
}

interface ExerciseSuggestionListProps {
  query: string;
  suggestions: ExerciseSuggestion[];
  onSelectSuggestion: (suggestion: ExerciseSuggestion) => void;
  onCreateExercise: (name: string) => void;
}

export const ExerciseSuggestionList = ({
  query,
  suggestions,
  onSelectSuggestion,
  onCreateExercise
}: ExerciseSuggestionListProps): React.JSX.Element => {
  const trimmed = query.trim();

  if (!trimmed) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      {suggestions.length > 0 ? (
        suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => onSelectSuggestion(suggestion)}
            style={styles.item}
            accessibilityRole="button"
          >
            <Text>{suggestion.name}</Text>
          </Pressable>
        ))
      ) : (
        <Text>No matches found.</Text>
      )}
      <Pressable
        style={styles.createButton}
        onPress={() => onCreateExercise(trimmed)}
        accessibilityRole="button"
      >
        <Text>{`Create "${trimmed}"`}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 8,
    marginBottom: 12
  },
  item: {
    backgroundColor: '#efefef',
    borderRadius: 6,
    padding: 10
  },
  createButton: {
    backgroundColor: '#dbf3de',
    borderRadius: 6,
    padding: 10
  }
});
