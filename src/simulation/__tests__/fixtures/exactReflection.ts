import type { Reflection } from "../../spaces/Space";

// Reference implementations of wall-by-wall reflection, the Phase 2 loop that reflects off one wall at a time.
// Every finite double is an integer multiple of 2^-1074, so scaled to that unit the loop runs in exact integer
// arithmetic. The floating-point loop is kept too, with a record of whether each of its steps was exact.

const float = new Float64Array(1);
const bits = new BigUint64Array(float.buffer);

// The exact value of a finite double, in units of 2^-1074.
export function exactUnits(value: number): bigint {
  float[0] = value;
  const raw = bits[0]!;
  const exponent = (raw >> 52n) & 0x7ffn;
  const fraction = raw & ((1n << 52n) - 1n);
  const magnitude = exponent === 0n ? fraction : (fraction | (1n << 52n)) << (exponent - 1n);
  return raw >> 63n === 1n ? -magnitude : magnitude;
}

export interface ExactReflection {
  units: bigint;
  lastWall: Reflection["lastWall"];
  reflections: number;
}

// Wall-by-wall reflection in exact arithmetic. Each step mirrors the coordinate in one wall, so the number of
// steps is about |value| / max: keep coordinates within a few hundred periods of the range.
export function exactWallByWallReflection(value: number, max: number): ExactReflection {
  const wall = exactUnits(max);
  let result = exactUnits(value);
  let lastWall: Reflection["lastWall"];
  let reflections = 0;
  while (result < 0n || result > wall) {
    if (result < 0n) {
      result = -result;
      lastWall = "low";
      reflections += 1;
    }
    if (result > wall) {
      result = wall - (result - wall);
      lastWall = "high";
      reflections += 1;
    }
  }
  return { units: result, lastWall, reflections };
}

export interface FloatingReflection extends Reflection {
  // Every subtraction the loop made was exact, so its result is the exact reflection.
  exact: boolean;
}

// The Phase 2 loop as it ran in floating point.
export function floatingWallByWallReflection(value: number, max: number): FloatingReflection {
  const wall = exactUnits(max);
  let result = value;
  let lastWall: Reflection["lastWall"];
  let exact = true;
  while (result < 0 || result > max) {
    if (result < 0) {
      result = -result;
      lastWall = "low";
    }
    if (result > max) {
      const beyond = result - max;
      exact &&= exactUnits(beyond) === exactUnits(result) - wall;
      result = max - beyond;
      exact &&= exactUnits(result) === wall - exactUnits(beyond);
      lastWall = "high";
    }
  }
  return lastWall === undefined ? { value: result, exact } : { value: result, lastWall, exact };
}
