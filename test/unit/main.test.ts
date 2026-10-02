import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockGlobal, mockInstanceOf, mockStructure } from "./screeps-mock";
import { RoleHarvester } from "../../src/roles/Harvester";
import { loop } from "../../src/main";

describe("main", () => {
  beforeEach(() => {
    mockGlobal<Game>("Game", {
      time: 12345,
      creeps: {},
      rooms: {},
      spawns: {}
    });
    mockGlobal<Memory>("Memory", {
      creeps: {}
    });
  });

  it("should export a loop function", () => {
    expect(typeof loop).toBe("function");
  });

  it("should return void when called with no context", () => {
    expect(loop()).toBeUndefined();
  });

  it("Automatically delete memory of missing creeps", () => {
    const creepMemory: CreepMemory = { role: "harvester", room: "W1N1", working: false };
    Memory.creeps.persistValue = creepMemory;
    Memory.creeps.notPersistValue = creepMemory;

    Game.creeps.persistValue = mockInstanceOf<Creep>({ memory: creepMemory });

    loop();

    // Deleted keys are absent from the strict mocks, so assert on key
    // presence rather than reading the values back.
    expect("persistValue" in Memory.creeps).toBe(true);
    expect("notPersistValue" in Memory.creeps).toBe(false);
  });

  it("spawns a harvester when the population is below target", () => {
    const spawn = mockStructure(STRUCTURE_SPAWN, {
      spawning: undefined,
      spawnCreep: () => OK,
      room: { name: "W1N1" }
    });
    mockGlobal<Game>("Game", {
      time: 100,
      creeps: {},
      spawns: { Spawn1: spawn }
    });

    RoleHarvester.spawn(Game.creeps, 1);

    // spawnCreep is a vi.fn() property on a plain mock object, not a prototype
    // method - unbinding is impossible by construction.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const spawnCreep = vi.mocked(spawn.spawnCreep);
    expect(spawnCreep).toHaveBeenCalledTimes(1);
    expect(spawnCreep.mock.calls[0][0]).toEqual([WORK, CARRY, MOVE]);
    expect(spawnCreep.mock.calls[0][1]).toBe("harvester100");
    expect(spawnCreep.mock.calls[0][2]!.memory!.role).toBe("harvester");
  });

  it("strict mocks throw on access to unmocked properties, naming the path", () => {
    // `spawns` is mocked as an empty object; `Spawn1` is the key nobody set.
    expect(() => Game.spawns.Spawn1).toThrowError(
      /Unexpected access to unmocked property "Game\.spawns\.Spawn1"/
    );
  });
});
