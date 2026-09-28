import { CreepUtils } from "utils/CreepTools";
import { ErrorMapper } from "utils/ErrorMapper";
import { RoleBuilder } from "roles/Builder";
import { RoleHarvester } from "roles/Harvester";
import { RoleUpgrader } from "roles/Upgrader";

export const ROLES = ['harvester', 'builder', 'upgrader'] as const;

declare global {
  type CreepRole = typeof ROLES[number];
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: CreepRole;
    room: string;
    working: boolean;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
/*
declare const global: {
  log: any;
}
*/
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  CreepUtils.removeDeadCreeps(Memory)

  RoleHarvester.spawn(Game.creeps, 2);
  RoleUpgrader.spawn(Game.creeps, 1);
  RoleBuilder.spawn(Game.creeps, 1);

  if (Game.spawns.Spawn1.spawning) {
    const spawningCreep = Game.creeps[Game.spawns.Spawn1.spawning.name];
    Game.spawns.Spawn1.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns.Spawn1.pos.x + 1,
      Game.spawns.Spawn1.pos.y,
      { align: 'left', opacity: 0.8 });
  }

  for(const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (creep.memory.role === 'harvester') {
      const roleHarvester = new RoleHarvester(creep);
      roleHarvester.run();
    }
    if (creep.memory.role === 'upgrader') {
      const roleUpgrader = new RoleUpgrader(creep);
      roleUpgrader.run();
    }
    if (creep.memory.role === 'builder') {
      const roleBuilder = new RoleBuilder(creep);
      roleBuilder.run();
    }
  }
});
