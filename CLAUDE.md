# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `bun run tauri dev` — start the app in dev mode (starts Vite dev server + Rust backend with hot reload)
- `bun run dev` — start Vite frontend dev server only (port 5173)
- `bun run build` — type-check (`tsc`) then bundle frontend (`vite build`)
- `bun run tauri build` — production build of the full Tauri app

## Architecture

Tauri 2 desktop app: React frontend communicating with a Rust backend via Tauri IPC.

### Frontend (src/)
- React 19 + TypeScript + Vite 8 + TailwindCSS 4 (via `@tailwindcss/vite` plugin, not PostCSS)
- shadcn/ui (base-nova style, lucide icons) — components live in `src/components/ui/`
- Path alias: `@/*` → `./src/*`
- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`

### Backend (src-tauri/)
- Rust with Tauri 2. Entry: `main.rs` → `lib.rs` (`app_lib::run`)
- `tauri-plugin-log` enabled in debug builds only
- Capabilities defined in `src-tauri/capabilities/default.json`
- Product name: "My Tools", identifier: `com.tauri.dev`

### Package Manager
Uses **bun** (bun.lock present).
