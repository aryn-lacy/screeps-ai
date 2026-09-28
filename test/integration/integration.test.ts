import { describe, expect, it } from "vitest";
import { helper } from "./helper";

describe("main", () => {
  it("runs a server and matches the game tick", async function () {
    for (let i = 1; i < 10; i += 1) {
      expect(await helper.server.world.gameTime).toBe(i);
      await helper.server.tick();
    }
  });

  it("writes and reads to memory", async function () {
    await helper.player.console(`Memory.foo = 'bar'`);
    await helper.server.tick();
    const memory = JSON.parse(await helper.player.memory);
    expect(memory.foo).toBe('bar');
  });
});