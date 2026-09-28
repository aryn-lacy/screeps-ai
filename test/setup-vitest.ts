// @types/lodash@3 only declares the global `_`, not a "lodash" module, so this
// import intentionally has no types; only its runtime value matters here.
// @ts-ignore
import lodash from "lodash";

// Screeps provides lodash as the global `_` in-game, and the bot source relies
// on it (e.g. utils/CreepTools.ts uses `_.filter`), so mirror that for tests.
(global as any)._ = lodash;