import { CreepUtils } from "../utils/CreepTools";
import { RoleBase } from "./Base";

export class RoleBuilder extends RoleBase {
  public static roleName: CreepRole = 'builder';

  public run(): void {
    const { creep } = this;

    let msg = '🔄 harvest';
    if (CreepUtils.isWorking(creep)) {
      msg = '🚧 build';
    }
    creep.say(msg);

    if (creep.memory.working) {
      // Build sites
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if(targets.length > 0) {
        if(creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }

        // repair stuctures
        const repairStructs = creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });

        repairStructs.sort((a,b) => a.hits - b.hits);

        if(repairStructs.length > 0) {
            if(creep.repair(repairStructs[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(repairStructs[0]);
            }
        }
      }
      else {
        // Once a building is built even if you have energy go back to harvesting
        creep.memory.working = false;
      }
    }
    else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }

}
