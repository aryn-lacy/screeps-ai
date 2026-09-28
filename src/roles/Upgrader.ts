import { CreepUtils } from "utils/CreepTools";
import { RoleBase } from "./Base";

export class RoleUpgrader extends RoleBase {
  public static roleName: CreepRole = 'upgrader';

  public run(): void {
    const { creep } = this;

    // Tell us what you are doing!
    let msg = '🔄 harvest';
    if (CreepUtils.isWorking(creep)) {
      msg = '⚡ upgrade';
    }
    creep.say(msg);

    if (creep.memory.working) {
      const controller = creep.room.controller;
      if(controller && creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
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
