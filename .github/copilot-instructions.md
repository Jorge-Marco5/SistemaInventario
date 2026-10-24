# Copilot instructions for SistemaInventario

## Project overview

This repository is a Tauri desktop app for inventory management. The app is split into two main layers:

- Frontend: `src/` contains the UI shell, tab router, page controllers, reusable components, and service calls.
- Backend: `src-tauri/src/` contains the Rust app that exposes Tauri commands, manages SQLite access, and implements the inventory domain logic.

The desktop app uses SQLite stored in the OS app data directory, with migrations in `src-tauri/migrations/`. The startup flow in `src-tauri/src/lib.rs` creates the DB pool, runs migrations, and registers the shared app state before the Tauri command handler is registered.

## Build, test, and validation commands

Use the repository commands below from the project root:

- Install dependencies:
  - `pnpm install`
- Start the app in development mode:
  - `pnpm dev`
  - Equivalent lower-level command: `pnpm tauri dev`
- Build production bundles:
  - `pnpm run tauri build`
- Run the Rust test suite:
  - `cargo test --manifest-path src-tauri/Cargo.toml`
- Run a single Rust test by name:
  - `cargo test --manifest-path src-tauri/Cargo.toml <test_name>`
- Type-check / compile the Rust backend without running tests:
  - `cargo check --manifest-path src-tauri/Cargo.toml`
- Check formatting:
  - `cargo fmt --manifest-path src-tauri/Cargo.toml --check`

Notes:
- There is no dedicated JavaScript lint script in `package.json` right now.
- The CI workflow in `.github/workflows/build.yml` builds the Tauri app for both Windows and Ubuntu using `pnpm install` and the Tauri release action.

## Architecture and data flow

### Frontend (`src/`)

- `src/index.html` is the app shell that hosts the tab container and templates.
- `src/main.js` wires the app lifecycle and registers tab controllers.
- `src/hooks/router.js` handles URL-based navigation, query strings, and tab mounting.
- `src/hooks/pages/*.js` contain page-specific logic for products, operations, providers, categories, and lots.
- `src/hooks/services/*.js` are the frontend side of the backend contract; they call into Tauri commands via the invoke API.
- Styling lives under `src/assets/css/` and is applied through the static app shell rather than a bundler-driven component system.

### Backend (`src-tauri/src/`)

The Rust backend follows a layered structure:

- `lib.rs`: Tauri entry point. It configures app state, creates the SQLite pool, runs migrations, and exposes command handlers.
- `commands/`: public Tauri command functions. These are the boundary between the UI and the backend.
- `services/`: domain/business logic for inventory features.
- `repositories/`: SQL access and database-specific CRUD logic.
- `models/`: domain structs used across services and repositories.
- `database/`: database setup and migration runner.
- `state/`: shared application state (currently holds the SQLite pool).
- `utils/`: reusable helpers.

This project follows the pattern: frontend page -> Tauri command -> service -> repository -> SQLite.

## Repository conventions

- Preserve the existing feature split by domain (products, categorias, providers, operations, lots, users).
- When editing the database layer, prefer the repository + migration pattern already in use. SQLite migrations live under `src-tauri/migrations/` and are executed automatically at startup.
- Keep command handlers thin. Avoid embedding business logic directly in Tauri commands; delegate to services.
- Keep SQL logic in repository files instead of scattering ad hoc queries across the app.
- Follow the established naming and module layout already present in `src-tauri/src/{commands,services,repositories,models}`.
- Frontend navigation is route- and query-string-driven through `src/hooks/router.js`; keep new tabs aligned with that pattern instead of adding custom page bootstrapping.
- Maintain the current Spanish inventory terminology and UI labels unless the task specifically requires English-only changes.

## Safe change patterns

- If you add a new inventory entity or operation, mirror the existing CRUD flow used by neighboring modules.
- If you modify the schema, add or update the corresponding migration and confirm startup still runs migrations cleanly.
- When touching frontend behavior, prefer the existing `hooks/pages` and `hooks/services` patterns over creating a totally separate app structure.
- If you need to validate a Rust change without running the full app, prefer `cargo check` or a targeted `cargo test` over a full Tauri build until the specific behavior is confirmed.

## Release workflow

The project includes a multi-platform release workflow at `.github/workflows/build.yml` that builds app bundles for both Windows and Ubuntu. Use the same Tauri + pnpm tooling when validating packaging changes.
