export class CreepUtils {
  public static removeDeadCreeps(memory: Memory): void {
    for (const name in memory.creeps) {
      if (!(name in Game.creeps)) {
        delete memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
      }
    }
  }

  public static countCreeps(creeps: typeof Game.creeps, role: string) {
    return _.filter(creeps, (creep) => creep.memory.role === role);
  }

  public static isWorking(creep: Creep): boolean {
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
    }
    return creep.memory.working;
  }
}
