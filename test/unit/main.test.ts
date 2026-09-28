import { beforeEach, describe, expect, it, vi } from "vitest";
import { loop } from "../../src/main";
import { Game, Memory } from "./mock";

describe("main", () => {
  beforeEach(() => {
    // The mocks are cloned *shallowly* on purpose: the game globals share the
    // nested `creeps` objects with the mocks imported above, which is how the
    // assertions below observe what `loop()` changed.
    vi.stubGlobal("Game", _.clone(Game));
    vi.stubGlobal("Memory", _.clone(Memory));
  });

  it("should export a loop function", () => {
    expect(typeof loop).toBe("function");
  });

  it("should return void when called with no context", () => {
    expect(loop()).toBeUndefined();
  });

  it("Automatically delete memory of missing creeps", () => {
    Memory.creeps.persistValue = "any value";
    Memory.creeps.notPersistValue = "any value";

    Game.creeps.persistValue = "any value";

    loop();

    expect(Memory.creeps.persistValue).toBeDefined();
    expect(Memory.creeps.notPersistValue).toBeUndefined();
  });
});