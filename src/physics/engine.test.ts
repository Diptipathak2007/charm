import { describe, expect, it } from "vitest";
import {
  DEFAULT_PHYSICS,
  isSettled,
  stepPhysics,
  type PhysicsConfig,
  type PhysicsState,
} from "./engine";

function simulate(
  initial: PhysicsState,
  seconds: number,
  config: PhysicsConfig = DEFAULT_PHYSICS,
): PhysicsState {
  const state = { ...initial };
  const frames = Math.round(seconds * 60);
  for (let frame = 0; frame < frames; frame += 1) {
    stepPhysics(state, { x: 0, y: 0 }, config, 1 / 60);
  }
  return state;
}

describe("spring-damper physics", () => {
  it("integrates displacement and velocity without React state", () => {
    const state = { x: 40, y: 0, velocityX: 0, velocityY: 0 };
    stepPhysics(state, { x: 0, y: 0 }, DEFAULT_PHYSICS, 1 / 60);

    expect(state.x).toBeLessThan(40);
    expect(state.velocityX).toBeLessThan(0);
    expect(state.velocityY).toBeGreaterThan(0);
  });

  it("damping removes energy", () => {
    const initial = { x: 80, y: 0, velocityX: 220, velocityY: 0 };
    const damped = simulate(initial, 2);
    const undamped = simulate(initial, 2, {
      ...DEFAULT_PHYSICS,
      damping: 0,
    });
    const dampedEnergy = damped.x ** 2 + damped.velocityX ** 2;
    const undampedEnergy = undamped.x ** 2 + undamped.velocityX ** 2;

    expect(dampedEnergy).toBeLessThan(undampedEnergy * 0.05);
  });

  it("settles near the gravity-adjusted rest point", () => {
    const state = simulate(
      { x: 95, y: 45, velocityX: -180, velocityY: 120 },
      8,
    );

    expect(isSettled(state, { x: 0, y: 0 }, DEFAULT_PHYSICS, 0.1)).toBe(true);
    expect(state.y).toBeCloseTo(
      DEFAULT_PHYSICS.gravity / DEFAULT_PHYSICS.springStrength,
      1,
    );
  });

  it("clamps extreme motion to safe swing bounds", () => {
    const state = { x: 10_000, y: 10_000, velocityX: 0, velocityY: 0 };
    stepPhysics(state, { x: 0, y: 0 }, DEFAULT_PHYSICS, 1 / 60);

    expect(Math.abs(state.x)).toBeLessThanOrEqual(DEFAULT_PHYSICS.maxSwing);
    expect(state.y).toBeLessThanOrEqual(DEFAULT_PHYSICS.maxSwing * 0.72);
  });
});
