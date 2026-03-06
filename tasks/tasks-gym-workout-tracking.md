## Relevant Files

- `package.json` - Project scripts and dependencies for React Native, navigation, storage, forms, and testing.
- `app.json` - React Native app configuration (name, platform settings, permissions).
- `babel.config.js` - Babel setup required for React Native and test tooling.
- `jest.config.js` - Jest configuration for unit and component tests.
- `src/navigation/AppNavigator.tsx` - Main navigation stack for workout logging, history, stats, and exercise management.
- `src/screens/WorkoutSessionScreen.tsx` - Main workout logging screen with set entry and exercise suggestions.
- `src/screens/WorkoutHistoryScreen.tsx` - Workout history list screen.
- `src/screens/WorkoutDetailScreen.tsx` - Session detail screen showing exercises and sets.
- `src/screens/ExerciseLibraryScreen.tsx` - Saved exercise list and search/tag filtering.
- `src/screens/ExerciseEditorScreen.tsx` - Create/edit exercise form with name, photo, and tags.
- `src/screens/ExerciseStatsScreen.tsx` - Per-exercise weight trend visualization.
- `src/components/ExerciseSuggestionList.tsx` - Reusable suggestion list for saved exercises while logging.
- `src/components/SetEntryRow.tsx` - Reusable set input row (weight/reps/edit/delete).
- `src/components/WeightTrendChart.tsx` - Reusable chart component for weight progression.
- `src/db/schema.ts` - Local DB schema for workouts, exercises, sets, and tags.
- `src/db/database.ts` - Database connection and migration setup.
- `src/db/repositories/workoutRepository.ts` - CRUD operations for sessions, exercises in sessions, and sets.
- `src/db/repositories/exerciseRepository.ts` - CRUD/search operations for saved exercises, tags, and photo URI fields.
- `src/services/workoutService.ts` - Business logic for session creation, validation, and persistence.
- `src/services/exerciseService.ts` - Business logic for exercise suggestions, creation, and tag handling.
- `src/services/statsService.ts` - Business logic for per-exercise trend calculations.
- `src/utils/unitConversion.ts` - kg/lb conversion helpers and formatting.
- `src/utils/validation.ts` - Shared input validation rules for weight, reps, and exercise names.
- `src/types/models.ts` - Type definitions for workout, set, exercise, tag, and stats models.
- `src/state/useWorkoutStore.ts` - App state for active workout session and in-progress edits.
- `src/state/useSettingsStore.ts` - App state for user settings including selected weight unit.
- `src/services/imagePickerService.ts` - Wrapper for camera/gallery selection and photo URI normalization.
- `src/screens/__tests__/WorkoutSessionScreen.test.tsx` - Component tests for session logging flow.
- `src/screens/__tests__/ExerciseEditorScreen.test.tsx` - Component tests for exercise create/edit with photo/tags.
- `src/screens/__tests__/ExerciseStatsScreen.test.tsx` - Component tests for stats rendering and empty states.
- `src/services/__tests__/workoutService.test.ts` - Unit tests for workout persistence and validation behavior.
- `src/services/__tests__/exerciseService.test.ts` - Unit tests for suggestion and inline exercise creation logic.
- `src/services/__tests__/statsService.test.ts` - Unit tests for trend calculations.
- `src/utils/__tests__/unitConversion.test.ts` - Unit tests for kg/lb conversion and rounding.
- `src/utils/__tests__/validation.test.ts` - Unit tests for validation rules.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` -> `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b codex/gym-workout-tracking`)

- [x] 1.0 Initialize React Native app foundation and project configuration
  - [x] 1.1 Initialize React Native project structure (or align existing scaffold) for iOS and Android.
  - [x] 1.2 Install and configure free core dependencies (navigation, local DB, forms, validation, charting, image picker, testing).
  - [x] 1.3 Set up app navigation routes for workout session, history, detail, exercise library/editor, and stats screens.
  - [x] 1.4 Configure Jest and testing-library for React Native component and unit testing.
  - [x] 1.5 Define base TypeScript models for WorkoutSession, Exercise, ExerciseTag, ExerciseSet, and WeightTrendPoint.

- [x] 2.0 Implement local data layer for workouts, exercises, sets, tags, and exercise photos
  - [x] 2.1 Design and implement DB schema/tables for sessions, exercises, sets, tags, and exercise-tag relations.
  - [x] 2.2 Implement DB initialization and migrations with safe startup behavior.
  - [x] 2.3 Implement repository methods for workout CRUD and session detail retrieval.
  - [x] 2.4 Implement repository methods for exercise CRUD including photo URI and tag linkage.
  - [x] 2.5 Implement exercise search/suggestion query optimized for workout logging flow.
  - [x] 2.6 Add repository tests for create/read/update/delete and relational integrity.

- [ ] 3.0 Build workout logging flow with saved-exercise suggestions and inline exercise creation
  - [ ] 3.1 Build Workout Session screen UI with add-exercise, add-set, edit-set, and remove-set actions.
  - [ ] 3.2 Add validation rules: weight must be positive number; reps must be positive integer.
  - [ ] 3.3 Implement exercise suggestion list while typing/selecting exercise in a session.
  - [ ] 3.4 Implement inline “create new exercise” flow from workout session when no match exists.
  - [ ] 3.5 Build Exercise Editor screen with required exercise name and optional photo/tags.
  - [ ] 3.6 Integrate camera/gallery picker and persist selected photo URI for each exercise.
  - [ ] 3.7 Persist completed workout sessions and ensure session edits are saved locally.
  - [ ] 3.8 Add component/service tests for session logging, suggestion behavior, inline creation, and validation errors.

- [ ] 4.0 Build workout history and per-exercise weight trend statistics screens
  - [ ] 4.1 Build Workout History screen sorted by most recent session first.
  - [ ] 4.2 Build Workout Detail screen showing full exercises and set data for selected session.
  - [ ] 4.3 Implement stats service to compute per-exercise weight trend data over time.
  - [ ] 4.4 Build Exercise Stats screen with chart/timeline for selected exercise trend.
  - [ ] 4.5 Ensure empty states are handled clearly (no history, no stats yet).
  - [ ] 4.6 Add tests for history sorting, detail rendering, and trend calculation/visualization.

- [ ] 5.0 Add validation, offline/error states, and test coverage for core user flows
  - [ ] 5.1 Implement global and screen-level error states for invalid input, failed saves, and no suggestion matches.
  - [ ] 5.2 Add unit selection setting (kg/lb) and keep unit usage consistent in logging and stats views.
  - [ ] 5.3 Implement and test deterministic kg/lb conversion and display formatting.
  - [ ] 5.4 Verify all v1 flows work fully offline with local persistence after app restart.
  - [ ] 5.5 Run full test suite and fix failing tests.
  - [ ] 5.6 Perform manual QA checklist for: create exercise with photo/tags, log session, reuse suggested exercise, and view trend statistics.
