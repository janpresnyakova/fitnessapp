import { ExerciseRepository } from '../db/repositories/exerciseRepository';
import { validateExerciseName } from '../utils/validation';

const createId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export class ExerciseService {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async getSuggestions(query: string): Promise<Array<{ id: string; name: string }>> {
    const records = await this.exerciseRepository.searchExercises(query, 8);

    return records.map((record) => ({ id: record.id, name: record.name }));
  }

  async createInlineExercise(name: string): Promise<{ id: string; name: string }> {
    const validationError = validateExerciseName(name);

    if (validationError) {
      throw new Error(validationError);
    }

    const trimmedName = name.trim();
    const now = new Date().toISOString();
    const id = createId('exercise');

    await this.exerciseRepository.createExercise({
      id,
      name: trimmedName,
      createdAt: now,
      updatedAt: now,
      tagNames: []
    });

    return { id, name: trimmedName };
  }

  async upsertExercise(input: {
    id?: string;
    name: string;
    tagNames: string[];
    photoUri?: string;
  }): Promise<string> {
    const validationError = validateExerciseName(input.name);

    if (validationError) {
      throw new Error(validationError);
    }

    const now = new Date().toISOString();

    if (input.id) {
      await this.exerciseRepository.updateExercise({
        id: input.id,
        name: input.name,
        tagNames: input.tagNames,
        photoUri: input.photoUri,
        updatedAt: now
      });

      return input.id;
    }

    const id = createId('exercise');
    await this.exerciseRepository.createExercise({
      id,
      name: input.name,
      tagNames: input.tagNames,
      photoUri: input.photoUri,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }
}
