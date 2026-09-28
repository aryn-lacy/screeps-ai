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
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if(targets.length > 0) {
        if(creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
    else {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }

}
