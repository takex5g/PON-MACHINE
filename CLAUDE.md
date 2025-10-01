# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ponMachineSTEP** is an Electron desktop application that automates the opening and closing of graduation ceremony certificate tubes using MIDI signals. The system integrates STEP400 stepper motor controllers (via OSC/UDP) and BlackMagic ATEM video switchers (via atem-connection library).

**Tech Stack:**
- **Desktop Framework:** Electron 38
- **Frontend:** React 19 + TypeScript
- **Build System:** electron-vite + electron-builder
- **Communication:**
  - OSC (UDP) for STEP400 stepper motor control
  - Web MIDI API for MIDI input handling
  - atem-connection library for ATEM switcher control

## Common Development Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Type checking
npm run typecheck           # Check all
npm run typecheck:node      # Main/preload process only
npm run typecheck:web       # Renderer process only

# Code quality
npm run lint                # Run ESLint
npm run format              # Format with Prettier

# Build
npm run build               # Build all (runs typecheck first)
npm run build:win           # Windows installer
npm run build:mac           # macOS installer
npm run build:linux         # Linux installer
npm run build:unpack        # Build without packaging
```

## Architecture

### Process Structure

The application follows Electron's multi-process architecture:

1. **Main Process** (`src/main/index.ts`)
   - Manages BrowserWindow lifecycle
   - Initializes STEP400Controller and ATEMManager
   - Sets up IPC handlers for renderer ↔ main communication
   - STEP400 controller connects to `10.0.0.101:50000` on startup

2. **Preload Script** (`src/preload/index.ts`)
   - Exposes `window.api` object to renderer with contextBridge
   - Provides type-safe IPC methods: `api.step400.*`, `api.atem.*`, `api.midi.*`

3. **Renderer Process** (`src/renderer/src/`)
   - React UI with tab-based interface (MIDI, ステッピング, ATEM)
   - Web MIDI API integration via `useMidiInput` hook
   - Communicates with main process via `window.api`

### Key Modules

#### STEP400 Controller (`src/main/step400.ts`)

Manages stepper motors via OSC protocol:
- **Network:** UDP port `50100 + deviceID` for receiving responses
- **Features:** Position control, homing, speed profiles, automatic position reporting
- **Important Methods:**
  - `goTo(motorID, position)` - Move to absolute position
  - `move(motorID, steps)` - Relative movement
  - `homing(motorID)` - Execute homing sequence
  - `startPositionReport(motorID, intervalMs)` - Enable periodic position updates
- **EventEmitter:** Emits 'message' events for all OSC responses

#### ATEM Manager (`src/main/atem.ts`)

Controls BlackMagic ATEM switchers:
- **Network:** Connects to `10.0.0.14` by default
- **Features:** Camera switching with auto-transition (fade)
- **MIDI Integration:** Maps MIDI notes C/D/E/F to cameras 1/2/3/4
- **IPC Handlers:** `atem:connect`, `atem:disconnect`, `atem:switchCamera`, `atem:getStatus`

#### MIDI Input Hook (`src/renderer/src/hooks/useMidiInput.ts`)

React hook managing Web MIDI API:
- **3 Independent Ports:** Supports 3 separate MIDI input devices
  - Port 1 & 2: For tube control
  - Port 3: For ATEM camera switching (notes C, D, E, F)
- **Note Tracking:** Maintains last 50 notes per port
- **Auto-Discovery:** Automatically assigns first 3 available MIDI devices
- **Important:** Always removes existing listeners before adding new ones to prevent duplicates

### UI Components

- **TabContainer.tsx** - Main tab navigation
- **PonMachineControl.tsx** - MIDI note display for ports 1 & 2
- **CameraControl.tsx** - MIDI note display for port 3
- **SteppingControl.tsx** - Direct STEP400 motor control interface
- **ATEMControl.tsx** - ATEM connection and manual camera switching

## Network Configuration

- **STEP400 Controller:** `10.0.0.101:50000` (remote), `50101` (local, when deviceID=1)
- **ATEM Switcher:** `10.0.0.14` (default)

When changing STEP400 IP or device ID, update in `src/main/index.ts:8` and ensure local port calculation (`50100 + deviceID`) doesn't conflict.

## IPC Communication Pattern

All main ↔ renderer communication uses typed IPC:

```typescript
// In main process (src/main/index.ts)
ipcMain.on('step400:goTo', (_event, motorID: number, position: number) => {
  step400.goTo(motorID, position)
})

// In preload (src/preload/index.ts)
step400: {
  goTo: (motorID: number, position: number) =>
    ipcRenderer.send('step400:goTo', motorID, position)
}

// In renderer
window.api.step400.goTo(1, 5000)
```

Use `ipcMain.on` for fire-and-forget, `ipcMain.handle` for request-response patterns.

## STEP400 Position Management

The STEP400Controller automatically starts position reporting for motors 1 and 2 at 1-second intervals after connecting. Position values are logged to console but not currently sent to renderer. If you need real-time position in UI, add `ipcMain.handle('step400:getPosition')` and forward OSC responses via `webContents.send()`.

## MIDI Port 3 Behavior

MIDI Port 3 is dedicated to ATEM control. Only note-on events for C, D, E, F are forwarded to the main process via `window.api.midi.sendPort3Note()`, which triggers `atemManager.handleMidiNote()` to switch cameras.

## Build Configuration

- **electron-vite.config.ts** - Separate configs for main/preload/renderer
- **electron-builder.yml** - Packaging configuration
- **TypeScript configs:**
  - `tsconfig.node.json` - Main and preload processes
  - `tsconfig.web.json` - Renderer process
  - `tsconfig.json` - Root config

## Important Files

- `STEP400_ST-57BYG076-0604_48V.json` - Motor profile parameters (referenced in README, contains TVAL/speed settings)
