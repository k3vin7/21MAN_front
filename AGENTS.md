# AGENTS.md

## Project
This is a React + Vite + TypeScript frontend project for WorldBuild, a collaborative worldbuilding platform.

## Tech stack
- React
- Vite
- TypeScript
- React Router DOM
- Tailwind CSS
- Zustand
- TanStack Query
- lucide-react

## Development rules
- Use feature-based folder separation.
- Keep components small and reusable.
- Separate pages, components, mocks, services, stores, hooks, and types.
- Use mock services instead of real APIs.
- Use TypeScript types for all major data models.
- Use Tailwind CSS for styling.
- Prefer dark-mode-first UI.
- Do not put all UI into one large file.
- Do not skip responsive design.

## Commands
- Install dependencies with npm.
- Run dev server with `npm run dev`.
- Run type check if available.
- Run lint if configured.

## Completion criteria
- All routes should render without crashing.
- Mock data should connect the main screens naturally.
- Repo cards should open detail modals.
- Search filters should work with mock data.
- PR creation should lead to the AI review page.
- Forms should use localStorage where specified.