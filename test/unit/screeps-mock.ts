/**
 * Screeps mock helpers for Vitest.
 *
 * Ported from screeps-jest (https://github.com/eduter/screeps-jest, MIT) and
 * adapted for Vitest: `vi.fn()` replaces `jest-mock`, and the game constants /
 * prototype stubs live in `test/setup-vitest.ts` (installed via `setupFiles`)
 * instead of a Jest test environment.
 *
 * Mocks are strict: accessing a property that was not explicitly mocked throws
 * an error naming the exact property path, so tests fail loudly instead of
 * silently operating on `undefined`.
 */

/*
 * This file is deliberate `any` plumbing: it exists to fabricate typed objects
 * from partial specs (deep Proxy construction over Object.entries values).
 * The no-unsafe-* family fights that job, so it is disabled here only.
 * Everything else (array-type, unbound-method, etc.) stays enforced.
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import * as util from "util";
import { vi } from "vitest";

/**
 * Generic type for partial implementations of interfaces.
 */
type DeepPartialObject<T extends object> = {
  [P in keyof T]?: DeepPartial<T[P]>;
} & { [key: string]: any };

type DeepPartial<T> =
  T extends (infer U)[] ? DeepPartial<U>[] :
    T extends AnyObj ? (
      T extends boolean ? boolean : // \
      T extends number ? number :   //   > No type assertion needed to mock a tagged primitive
      T extends string ? string :   // /
        DeepPartialObject<T>
      ) : T;

type AnyObj = Record<string, any>;

/**
 * Conditional type for all concrete implementations of Structure.
 * Unlike Structure<T>, ConcreteStructure<T> gives you the actual concrete class that extends Structure<T>.
 */
type ConcreteStructure<T extends StructureConstant> =
  T extends STRUCTURE_EXTENSION ? StructureExtension
  : T extends STRUCTURE_RAMPART ? StructureRampart
  : T extends STRUCTURE_ROAD ? StructureRoad
  : T extends STRUCTURE_SPAWN ? StructureSpawn
  : T extends STRUCTURE_LINK ? StructureLink
  : T extends STRUCTURE_WALL ? StructureWall
  : T extends STRUCTURE_STORAGE ? StructureStorage
  : T extends STRUCTURE_TOWER ? StructureTower
  : T extends STRUCTURE_OBSERVER ? StructureObserver
  : T extends STRUCTURE_POWER_SPAWN ? StructurePowerSpawn
  : T extends STRUCTURE_EXTRACTOR ? StructureExtractor
  : T extends STRUCTURE_LAB ? StructureLab
  : T extends STRUCTURE_TERMINAL ? StructureTerminal
  : T extends STRUCTURE_CONTAINER ? StructureContainer
  : T extends STRUCTURE_NUKER ? StructureNuker
  : T extends STRUCTURE_FACTORY ? StructureFactory
  : T extends STRUCTURE_KEEPER_LAIR ? StructureKeeperLair
  : T extends STRUCTURE_CONTROLLER ? StructureController
  : T extends STRUCTURE_POWER_BANK ? StructurePowerBank
  : T extends STRUCTURE_PORTAL ? StructurePortal
  : T extends STRUCTURE_INVADER_CORE ? StructureInvaderCore
  : never;

/**
 * Represents a path for a property inside nested objects.
 */
type Path = (string | number | symbol)[];

const validIdentifier = /^[$A-Z_][0-9A-Z_$]*$/i;

/**
 * Returns a string representation of the path for a property.
 */
function pathToString(path: Path): string {
  return path
    .map((k, index) => {
      const key = k.toString();

      if (!isNaN(Number(key))) {
        return `[${key}]`;
      } else if (!validIdentifier.test(key)) {
        return `['${key}']`;
      } else if (index === 0) {
        return key;
      } else {
        return "." + key;
      }
    })
    .join("");
}

/**
 * Properties accessed internally by Vitest/Jest matchers, message formatters
 * and promise-like checks. Accessing these on a mock returns undefined rather
 * than throwing.
 */
const frameworkInternalStuff: (symbol | string | number)[] = [
  Symbol.iterator,
  Symbol.toStringTag,
  Symbol.toPrimitive,
  "asymmetricMatch",
  "$$typeof",
  "nodeType",
  "@@__IMMUTABLE_ITERABLE__@@",
  "@@__IMMUTABLE_RECORD__@@",
  "_isMockFunction",
  "mockClear",
  // lodash probes `.length` on collections (e.g. `_.filter(Game.creeps, ...)`)
  // to check array-likeness before falling back to key iteration; Game.creeps
  // and Game.spawns are plain objects, so this probe must return undefined.
  "length",
  "tagName",
  "hasAttribute",
  "constructor",
  "then",
  "catch",
  "finally",
];

/**
 * Mocks a global object instance, like Game or Memory, and returns it.
 *
 * @param name - the name of the global
 * @param mockedProps - the properties you need to mock for your test
 * @param allowUndefinedAccess - if false, accessing a property not present in mockedProps will throw an exception
 */
function mockGlobal<T extends object>(name: string, mockedProps: DeepPartialObject<T> = {}, allowUndefinedAccess: boolean = false): T {
  const g = globalThis as any;
  const finalMockedProps = { ...mockedProps, mockClear: () => {} };
  g[name] = createMock<T>(finalMockedProps, allowUndefinedAccess, [name]);
  return g[name] as T;
}

/**
 * Creates a mock instance of a class/interface.
 *
 * @param mockedProps - the properties you need to mock for your test
 * @param allowUndefinedAccess - if false, accessing a property not present in mockedProps will throw an exception
 */
function mockInstanceOf<T extends object>(mockedProps: DeepPartialObject<T> = {}, allowUndefinedAccess: boolean = false): T {
  return createMock(mockedProps, allowUndefinedAccess, []);
}

function createMock<T extends object>(mockedProps: DeepPartialObject<T>, allowUndefinedAccess: boolean, path: Path): T {
  const target: DeepPartialObject<T> = {};

  if (typeof mockedProps === "object" && mockedProps !== null) {
    Object.entries(mockedProps).forEach(([propName, mockedValue]) => {
      target[propName as keyof T] =
        typeof mockedValue === "function" ? vi.fn(mockedValue) as any
          : Array.isArray(mockedValue) ? mockedValue.map((element, index) => createMock(element, allowUndefinedAccess, [...path, propName, index]))
          : typeof mockedValue === "object" && shouldMockObject(mockedValue) ? createMock(mockedValue, allowUndefinedAccess, [...path, propName])
            : mockedValue;
    });
    return new Proxy<T>(target as T, {
      get(t: T, p: PropertyKey): any {
        if (p in target) {
          return target[p.toString()];
        } else if (!allowUndefinedAccess && !frameworkInternalStuff.includes(p)) {
          throw new Error(
            `Unexpected access to unmocked property "${pathToString([...path, p])}".\n` +
            "Did you forget to mock it?\n" +
            "If you intended for it to be undefined, you can explicitly set it to undefined (recommended) or set \"allowUndefinedAccess\" argument to true."
          );
        } else {
          return undefined;
        }
      }
    });
  }
  return mockedProps;
}

function shouldMockObject(value: object) {
  return (
    value !== null
    && Object.getPrototypeOf(value) === Object.prototype
    && !util.types.isProxy(value)
  );
}

/**
 * Keeps counters for each structure type, to generate unique IDs for them.
 */
const structureCounters: { [key: string]: number } = {};

/**
 * Creates a mock instance of a structure, with a unique ID, structure type and toJSON.
 * The unique IDs allow deep-equality matchers to tell them apart.
 *
 * @param structureType
 * @param mockedProps - the additional properties you need to mock for your test
 */
function mockStructure<T extends StructureConstant>(structureType: T, mockedProps: DeepPartialObject<ConcreteStructure<T>> = {}): ConcreteStructure<T> {
  const count = (structureCounters[structureType] ?? 0) + 1;

  structureCounters[structureType] = count;
  const id = `${structureType}${count}` as unknown as Id<ConcreteStructure<T>>;
  return mockInstanceOf<ConcreteStructure<T>>({
    id,
    structureType,
    toJSON() {
      return { id, structureType };
    },
    ...mockedProps
  });
}

/**
 * Creates a mock instance of RoomPosition.
 */
function mockRoomPosition(x: number, y: number, roomName: string): RoomPosition {
  return mockInstanceOf<RoomPosition>({
    x,
    y,
    roomName,
    toJSON: () => ({ x, y, roomName })
  });
}

export {
  mockGlobal,
  mockInstanceOf,
  mockRoomPosition,
  mockStructure
};
