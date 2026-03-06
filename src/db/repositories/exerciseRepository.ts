import { Exercise, ExerciseTag } from '../../types/models';
import { DatabaseClient } from '../types';

export interface ExerciseCreateInput {
  id: string;
  name: string;
  photoUri?: string;
  tagNames?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseUpdateInput {
  id: string;
  name: string;
  photoUri?: string;
  tagNames?: string[];
  updatedAt: string;
}

export interface ExerciseRecord extends Exercise {
  tags: ExerciseTag[];
}

const normalizeTagNames = (tagNames: string[] = []): string[] => {
  const normalized = tagNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return Array.from(new Set(normalized));
};

const tagIdFromName = (name: string): string => `tag_${name.toLowerCase().replace(/\s+/g, '_')}`;

export class ExerciseRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createExercise(input: ExerciseCreateInput): Promise<void> {
    await this.db.execute(
      `INSERT INTO exercises (id, name, photo_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      [input.id, input.name.trim(), input.photoUri ?? null, input.createdAt, input.updatedAt]
    );

    await this.replaceExerciseTags(input.id, normalizeTagNames(input.tagNames));
  }

  async updateExercise(input: ExerciseUpdateInput): Promise<void> {
    await this.db.execute(
      `UPDATE exercises
       SET name = ?, photo_uri = ?, updated_at = ?
       WHERE id = ?;`,
      [input.name.trim(), input.photoUri ?? null, input.updatedAt, input.id]
    );

    await this.replaceExerciseTags(input.id, normalizeTagNames(input.tagNames));
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await this.db.execute('DELETE FROM exercises WHERE id = ?;', [exerciseId]);
  }

  async getExerciseById(exerciseId: string): Promise<ExerciseRecord | null> {
    const rows = await this.db.query<{
      id: string;
      name: string;
      photo_uri: string | null;
      created_at: string;
      updated_at: string;
    }>(
      'SELECT id, name, photo_uri, created_at, updated_at FROM exercises WHERE id = ?;',
      [exerciseId]
    );

    const exercise = rows[0];

    if (!exercise) {
      return null;
    }

    const tags = await this.getExerciseTags(exerciseId);

    return {
      id: exercise.id,
      name: exercise.name,
      photoUri: exercise.photo_uri ?? undefined,
      tagIds: tags.map((tag) => tag.id),
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
      tags
    };
  }

  async listExercises(): Promise<ExerciseRecord[]> {
    const rows = await this.db.query<{
      id: string;
      name: string;
      photo_uri: string | null;
      created_at: string;
      updated_at: string;
    }>('SELECT id, name, photo_uri, created_at, updated_at FROM exercises ORDER BY name COLLATE NOCASE ASC;');

    const records = await Promise.all(
      rows.map(async (exercise) => {
        const tags = await this.getExerciseTags(exercise.id);

        return {
          id: exercise.id,
          name: exercise.name,
          photoUri: exercise.photo_uri ?? undefined,
          tagIds: tags.map((tag) => tag.id),
          createdAt: exercise.created_at,
          updatedAt: exercise.updated_at,
          tags
        };
      })
    );

    return records;
  }

  async searchExercises(query: string, limit = 10): Promise<ExerciseRecord[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return this.listExercises();
    }

    const exact = normalizedQuery;
    const prefix = `${normalizedQuery}%`;
    const contains = `%${normalizedQuery}%`;

    const rows = await this.db.query<{ id: string }>(
      `SELECT e.id
       FROM exercises e
       LEFT JOIN exercise_tag_links etl ON etl.exercise_id = e.id
       LEFT JOIN exercise_tags t ON t.id = etl.tag_id
       WHERE e.name LIKE ? COLLATE NOCASE
          OR t.name LIKE ? COLLATE NOCASE
       GROUP BY e.id
       ORDER BY
         CASE
           WHEN e.name = ? COLLATE NOCASE THEN 0
           WHEN e.name LIKE ? COLLATE NOCASE THEN 1
           ELSE 2
         END,
         e.name COLLATE NOCASE ASC
       LIMIT ?;`,
      [contains, contains, exact, prefix, limit]
    );

    const exercises = await Promise.all(rows.map(({ id }) => this.getExerciseById(id)));

    return exercises.filter((exercise): exercise is ExerciseRecord => exercise !== null);
  }

  async listTags(): Promise<ExerciseTag[]> {
    return this.db.query<ExerciseTag>('SELECT id, name FROM exercise_tags ORDER BY name COLLATE NOCASE ASC;');
  }

  private async replaceExerciseTags(exerciseId: string, tagNames: string[]): Promise<void> {
    await this.db.execute('DELETE FROM exercise_tag_links WHERE exercise_id = ?;', [exerciseId]);

    for (const tagName of tagNames) {
      const tagId = tagIdFromName(tagName);

      await this.db.execute(
        `INSERT OR IGNORE INTO exercise_tags (id, name)
         VALUES (?, ?);`,
        [tagId, tagName]
      );

      await this.db.execute(
        `INSERT OR IGNORE INTO exercise_tag_links (exercise_id, tag_id)
         VALUES (?, ?);`,
        [exerciseId, tagId]
      );
    }
  }

  private async getExerciseTags(exerciseId: string): Promise<ExerciseTag[]> {
    return this.db.query<ExerciseTag>(
      `SELECT t.id, t.name
       FROM exercise_tags t
       INNER JOIN exercise_tag_links etl ON etl.tag_id = t.id
       WHERE etl.exercise_id = ?
       ORDER BY t.name COLLATE NOCASE ASC;`,
      [exerciseId]
    );
  }
}
