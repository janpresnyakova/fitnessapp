# PRD: Gym Workout Tracking App (React Native)

## 1. Introduction/Overview
This product is a cross-platform mobile fitness app focused on gym workout tracking. Users need a fast way to log exercises during each gym session, recording weight and reps, and then review progress over time.

For v1, the product is limited to gym workout tracking only. The app must support manual workout entry plus a saved exercise library. The primary user value is quick logging plus clear per-exercise weight growth statistics.

## 2. Goals
- Enable users to log gym workouts quickly and consistently.
- Help users increase strength by showing weight progression per exercise.
- Provide a reliable, simple v1 experience for a single user on one device.
- Use free frameworks and tools, with React Native as the app framework.

## 3. User Stories
- As a gym user, I want to create a workout log with exercises, weights, and reps so I can track what I did.
- As a gym user, I want to save each new exercise with a name, photo, and tags so I can organize my exercise list.
- As a gym user, when logging a workout, I want suggested saved exercises and the option to create a new one so I can log faster.
- As a gym user, I want to view exercise-specific weight trends over time so I can see if I am getting stronger.
- As a gym user, I want to edit mistakes in logged sets so my history remains accurate.
- As a gym user, I want my workout history stored on my device so I can access past sessions without an account.

## 4. Functional Requirements
1. The system must allow users to create a workout session with date and start/end time.
2. The system must allow users to add one or more exercises to a workout session.
3. The system must allow users to log multiple sets per exercise.
4. For each set, the system must allow users to enter:
   - Exercise (selected from saved exercises or created inline)
   - Weight value
   - Reps count
5. The system must validate input values:
   - Weight must be a positive number.
   - Reps must be a positive integer.
6. The system must allow users to edit and delete logged sets before and after saving a session.
7. The system must allow users to manually create a workout from scratch (manual flow).
8. The system must allow users to create and save a new exercise profile with:
   - Exercise name (required)
   - Exercise photo (optional)
   - One or more tags (optional, for example: chest, push, dumbbell)
9. The system must allow users to edit and delete saved exercises.
10. The system must suggest saved exercises while the user is adding exercises to a workout session.
11. The system must allow users to create a new exercise from the workout logging flow when no suitable saved exercise exists.
12. The system must store workout and saved-exercise data locally on the device (no required login).
13. The system must provide a workout history list sorted by most recent session first.
14. The system must allow users to open a past session and review all exercises, sets, weights, and reps.
15. The system must provide per-exercise weight trend statistics over time.
16. The system must present trend data in a readable chart or timeline view for each exercise.
17. The system must allow users to choose metric units for weight (kg or lb).
18. The system must keep weight units consistent in logs and statistics once selected, unless user changes setting.
19. The system must support offline usage for all v1 features.
20. The system must run on both iOS and Android using React Native.
21. The system must include basic error states (for example, invalid input, empty history, and no search matches) with clear user-facing messages.

## 5. Non-Goals (Out of Scope)
- Multi-user support on the same device.
- User accounts, cloud sync, or cross-device sync.
- Social sharing, leaderboards, or community features.
- Nutrition/calorie tracking.
- Body measurements tracking (body weight, body fat, etc.).
- Workout templates or predefined routines.
- Wearable integrations (Apple Watch, Garmin, etc.).
- AI coaching or workout recommendations.

## 6. Design Considerations (optional)
- Prioritize one-handed, low-friction logging during active workouts.
- Keep key actions reachable in 1-2 taps (add set, edit set, finish session).
- Make trend charts simple and legible for small mobile screens.
- Use clear visual separation between exercises and sets to reduce entry mistakes.

## 7. Technical Considerations (optional)
- Framework: React Native (required).
- Tooling must be free/open-source where possible.
- Suggested free stack:
  - Navigation: React Navigation
  - Local storage/database: SQLite or Realm (free tier/open-source option)
  - Images: react-native-image-picker or Expo ImagePicker (free)
  - Charts: Victory Native XL or react-native-chart-kit (free)
  - Forms/validation: React Hook Form + Zod/Yup
- Must design data models to support:
  - Workout sessions
  - Exercises
  - Sets
  - Exercise tags
  - Exercise photo URI metadata
- Must ensure local persistence is resilient to app restarts and offline usage.
- Unit conversion logic (kg/lb) must be deterministic and tested.

## 8. Success Metrics
- At least 80% of test users can log a full workout (3 exercises, 3 sets each) in under 5 minutes.
- At least 90% of completed workouts contain valid weight and reps values (low input error rate).
- At least 70% of active users view exercise trend statistics at least once per week.
- App crash-free session rate is at least 99% during beta testing.
- At least 60% of users who log one workout return to log another workout within 7 days.

## 9. Open Questions
- Should warm-up sets be tracked differently from working sets in v1?
- Should trend statistics use best set, average set, or all sets per exercise by default?
- Should exercise photos be captured from camera, selected from gallery, or both in v1?
- Should tags be free-text, predefined, or hybrid in v1?
- What minimum OS versions (iOS/Android) should be officially supported?
- Should users be able to back up data manually (for example, export to file) in v1.1?
