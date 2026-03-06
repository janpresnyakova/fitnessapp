import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getExerciseService } from '../services/runtimeServices';
import { ExerciseService } from '../services/exerciseService';
import { imagePickerService } from '../services/imagePickerService';
import { validateExerciseName } from '../utils/validation';

interface ExerciseEditorScreenProps {
  exerciseService?: ExerciseService;
  pickImageFromCamera?: () => Promise<string | undefined>;
  pickImageFromLibrary?: () => Promise<string | undefined>;
}

export const ExerciseEditorScreen = ({
  exerciseService: injectedExerciseService,
  pickImageFromCamera,
  pickImageFromLibrary
}: ExerciseEditorScreenProps): React.JSX.Element => {
  const route = useRoute();
  const routeParams = route.params as RootStackParamList['ExerciseEditor'] | undefined;

  const [exerciseService, setExerciseService] = useState<ExerciseService | null>(injectedExerciseService ?? null);
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (injectedExerciseService || exerciseService) {
      return;
    }

    getExerciseService()
      .then((service) => {
        if (isMounted) {
          setExerciseService(service);
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
  }, [exerciseService, injectedExerciseService]);

  const activeService = useMemo(() => exerciseService ?? injectedExerciseService ?? null, [exerciseService, injectedExerciseService]);

  const saveExercise = async (): Promise<void> => {
    if (!activeService) {
      return;
    }

    const validationError = validateExerciseName(name);

    if (validationError) {
      setErrorMessage(validationError);
      setSavedMessage(null);
      return;
    }

    setErrorMessage(null);

    try {
      await activeService.upsertExercise({
        id: routeParams?.exerciseId,
        name: name.trim(),
        tagNames: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        photoUri
      });

      setSavedMessage('Exercise saved');
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setSavedMessage(null);
    }
  };

  const chooseCamera = async (): Promise<void> => {
    const uri = await (pickImageFromCamera ?? imagePickerService.pickFromCamera)();

    if (uri) {
      setPhotoUri(uri);
    }
  };

  const chooseLibrary = async (): Promise<void> => {
    const uri = await (pickImageFromLibrary ?? imagePickerService.pickFromLibrary)();

    if (uri) {
      setPhotoUri(uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Exercise Editor</Text>

        <TextInput
          testID="exercise-name-input"
          placeholder="Exercise name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          testID="exercise-tags-input"
          placeholder="Tags separated by comma"
          style={styles.input}
          value={tagsInput}
          onChangeText={setTagsInput}
        />

        <Pressable accessibilityRole="button" style={styles.button} onPress={() => void chooseCamera()}>
          <Text>Use Camera</Text>
        </Pressable>

        <Pressable accessibilityRole="button" style={styles.button} onPress={() => void chooseLibrary()}>
          <Text>Pick from Gallery</Text>
        </Pressable>

        {photoUri ? <Text>{`Photo: ${photoUri}`}</Text> : <Text>No photo selected</Text>}

        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => void saveExercise()}>
          <Text style={styles.primaryButtonText}>Save Exercise</Text>
        </Pressable>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {savedMessage ? <Text style={styles.success}>{savedMessage}</Text> : null}
      </View>
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
    fontWeight: '700',
    fontSize: 22
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#ececec',
    padding: 10
  },
  primaryButton: {
    borderRadius: 8,
    backgroundColor: '#0c5f34',
    padding: 12
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700'
  },
  error: {
    color: '#b00020'
  },
  success: {
    color: '#0c5f34'
  }
});
