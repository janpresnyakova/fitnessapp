import { ExerciseSet, WorkoutSession } from '../../types/models';
import { DatabaseClient } from '../types';

export interface WorkoutSetInput {
  id: string;
  weight: number;
  reps: number;
}

export interface WorkoutSessionExerciseInput {
  id: string;
  exerciseId: string;
  sets: WorkoutSetInput[];
}

export interface CreateWorkoutSessionInput {
  id: string;
  startedAt: string;
  endedAt?: string;
  exercises: WorkoutSessionExerciseInput[];
}

export interface WorkoutSessionDetail {
  session: WorkoutSession;
  exercises: Array<{
    sessionExerciseId: string;
    exerciseId: string;
    sets: ExerciseSet[];
  }>;
}

export class WorkoutRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createWorkoutSession(input: CreateWorkoutSessionInput): Promise<void> {
    await this.db.execute(
      `INSERT INTO workout_sessions (id, started_at, ended_at, created_at)
       VALUES (?, ?, ?, ?);`,
      [input.id, input.startedAt, input.endedAt ?? null, input.startedAt]
    );

    await this.insertSessionExercises(input.id, input.exercises);
  }

  async updateWorkoutSession(input: CreateWorkoutSessionInput): Promise<void> {
    await this.db.execute(
      `UPDATE workout_sessions
       SET started_at = ?, ended_at = ?
       WHERE id = ?;`,
      [input.startedAt, input.endedAt ?? null, input.id]
    );

    await this.db.execute('DELETE FROM session_exercises WHERE session_id = ?;', [input.id]);
    await this.insertSessionExercises(input.id, input.exercises);
  }

  async deleteWorkoutSession(sessionId: string): Promise<void> {
    await this.db.execute('DELETE FROM workout_sessions WHERE id = ?;', [sessionId]);
  }

  async listWorkoutSessions(): Promise<WorkoutSession[]> {
    const rows = await this.db.query<{ id: string; started_at: string; ended_at: string | null }>(
      'SELECT id, started_at, ended_at FROM workout_sessions ORDER BY started_at DESC;'
    );

    const sessionExerciseRows = await this.db.query<{ session_id: string; exercise_id: string }>(
      'SELECT session_id, exercise_id FROM session_exercises ORDER BY order_index ASC;'
    );

    const exercisesBySession = sessionExerciseRows.reduce<Record<string, string[]>>((acc, row) => {
      const current = acc[row.session_id] ?? [];
      current.push(row.exercise_id);
      acc[row.session_id] = current;

      return acc;
    }, {});

    return rows.map((row) => ({
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at ?? undefined,
      exerciseIds: exercisesBySession[row.id] ?? []
    }));
  }

  async getWorkoutSessionDetail(sessionId: string): Promise<WorkoutSessionDetail | null> {
    const sessionRows = await this.db.query<{ id: string; started_at: string; ended_at: string | null }>(
      'SELECT id, started_at, ended_at FROM workout_sessions WHERE id = ?;',
      [sessionId]
    );

    const session = sessionRows[0];

    if (!session) {
      return null;
    }

    const exerciseRows = await this.db.query<{
      id: string;
      exercise_id: string;
      order_index: number;
    }>(
      `SELECT id, exercise_id, order_index
       FROM session_exercises
       WHERE session_id = ?
       ORDER BY order_index ASC;`,
      [sessionId]
    );

    const exercises = await Promise.all(
      exerciseRows.map(async (sessionExerciseRow) => {
        const sets = await this.db.query<{
          id: string;
          weight: number;
          reps: number;
        }>(
          `SELECT id, weight, reps
           FROM exercise_sets
           WHERE session_exercise_id = ?
           ORDER BY order_index ASC;`,
          [sessionExerciseRow.id]
        );

        return {
          sessionExerciseId: sessionExerciseRow.id,
          exerciseId: sessionExerciseRow.exercise_id,
          sets: sets.map((setRow) => ({
            id: setRow.id,
            sessionId,
            exerciseId: sessionExerciseRow.exercise_id,
            weight: setRow.weight,
            reps: setRow.reps,
            loggedAt: session.started_at
          }))
        };
      })
    );

    return {
      session: {
        id: session.id,
        startedAt: session.started_at,
        endedAt: session.ended_at ?? undefined,
        exerciseIds: exerciseRows.map((row) => row.exercise_id)
      },
      exercises
    };
  }

  private async insertSessionExercises(
    sessionId: string,
    exercises: WorkoutSessionExerciseInput[]
  ): Promise<void> {
    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex += 1) {
      const exercise = exercises[exerciseIndex];

      await this.db.execute(
        `INSERT INTO session_exercises (id, session_id, exercise_id, order_index)
         VALUES (?, ?, ?, ?);`,
        [exercise.id, sessionId, exercise.exerciseId, exerciseIndex]
      );

      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex += 1) {
        const set = exercise.sets[setIndex];

        await this.db.execute(
          `INSERT INTO exercise_sets (id, session_exercise_id, weight, reps, order_index)
           VALUES (?, ?, ?, ?, ?);`,
          [set.id, exercise.id, set.weight, set.reps, setIndex]
        );
      }
    }
  }
}
