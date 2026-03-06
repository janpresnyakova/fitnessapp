export interface Migration {
  version: number;
  statements: string[];
}

export const LATEST_SCHEMA_VERSION = 1;

export const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      'PRAGMA foreign_keys = ON;',
      `CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL COLLATE NOCASE,
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(name)
      );`,
      `CREATE TABLE IF NOT EXISTS exercise_tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL COLLATE NOCASE,
        UNIQUE(name)
      );`,
      `CREATE TABLE IF NOT EXISTS exercise_tag_links (
        exercise_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (exercise_id, tag_id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES exercise_tags(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS session_exercises (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
        UNIQUE(session_id, order_index)
      );`,
      `CREATE TABLE IF NOT EXISTS exercise_sets (
        id TEXT PRIMARY KEY,
        session_exercise_id TEXT NOT NULL,
        weight REAL NOT NULL CHECK(weight > 0),
        reps INTEGER NOT NULL CHECK(reps > 0),
        order_index INTEGER NOT NULL,
        FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE,
        UNIQUE(session_exercise_id, order_index)
      );`,
      'CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);',
      'CREATE INDEX IF NOT EXISTS idx_exercise_tags_name ON exercise_tags(name);',
      'CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON session_exercises(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_id ON session_exercises(exercise_id);',
      'CREATE INDEX IF NOT EXISTS idx_exercise_sets_session_exercise_id ON exercise_sets(session_exercise_id);'
    ]
  }
];
