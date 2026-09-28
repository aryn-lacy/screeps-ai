import { CreepUtils } from "utils/CreepTools";

export abstract class RoleBase {
  public static roleName: CreepRole | undefined;
  public abstract run(): void;

  public constructor(protected readonly creep: Creep) {}

  public static spawn(creeps: typeof Game.creeps, spawnNum: number) {
    if (this.roleName === undefined) {
      throw new Error("roleName must be defined in the subclass.");
    }
    const creepCount = CreepUtils.countCreeps(creeps, this.roleName);

    if(creepCount.length < spawnNum && !Game.spawns.Spawn1.spawning) {
      const newName = `${this.roleName}${Game.time}`;

      console.log(`Spawning new ${this.roleName}: ${newName}`);
      Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE], newName,
        { memory: { role: this.roleName, room: Game.spawns.Spawn1.room.name, working: false } });
    }
  }
}
