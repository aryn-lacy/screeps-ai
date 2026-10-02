// Vitest setup for unit tests: mirrors the Screeps runtime's global scope.
//
// In-game, the engine injects lodash, all game constants (OK, FIND_*, etc.)
// and the game object classes onto the global scope. Unit tests run in bare
// Node, so we install stand-ins here (wired via `setupFiles` in
// vitest.config.mts). Mock *instances* live in ./unit/screeps-mock.ts.
//
// The game constants are generated from screeps-jest's setupGlobals.ts (MIT).

/*
 * Global test bootstrap is inherently `any` plumbing: it installs untyped
 * runtime globals (lodash, game constants, prototype stubs) onto globalThis.
 * The no-unsafe-* family fights that job, so it is disabled here only.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import "./game-constants";

// @types/lodash@3 only declares the global `_`, not a "lodash" module, but
// module resolution finds the runtime package fine; only the value matters.
import lodash from "lodash";

const g = globalThis as any;

// Screeps provides lodash as the global `_` in-game, and the bot source relies
// on it (e.g. utils/CreepTools.ts uses `_.filter`), so mirror that for tests.
g._ = lodash;

// Stub the game classes' prototypes so modules that extend them
// (Creep.prototype.run = ...) can be imported without a real runtime.
// Mock *instances* are created with the helpers in test/unit/screeps-mock.ts.
[
  "ConstructionSite",
  "Creep",
  "Deposit",
  "Energy",
  "Flag",
  "Mineral",
  "Nuke",
  "OwnedStructure",
  "PowerCreep",
  "Resource",
  "Room",
  "RoomObject",
  "RoomPosition",
  "RoomVisual",
  "Ruin",
  "Source",
  "Spawn",
  "Store",
  "Structure",
  "StructureContainer",
  "StructureController",
  "StructureExtension",
  "StructureExtractor",
  "StructureFactory",
  "StructureInvaderCore",
  "StructureKeeperLair",
  "StructureLab",
  "StructureLink",
  "StructureNuker",
  "StructureObserver",
  "StructurePortal",
  "StructurePowerBank",
  "StructurePowerSpawn",
  "StructureRampart",
  "StructureRoad",
  "StructureSpawn",
  "StructureStorage",
  "StructureTerminal",
  "StructureTower",
  "StructureWall",
  "Tombstone"
].forEach((className) => {
  if (!g[className]) {
    g[className] = { prototype: {} };
  }
});
