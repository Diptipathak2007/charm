export interface PhysicsConfig {
  gravity: number;
  springStrength: number;
  damping: number;
  mass: number;
  maxSwing: number;
  dragInfluence: number;
}

export interface PhysicsState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

export interface PhysicsTarget {
  x: number;
  y: number;
}

export const DEFAULT_PHYSICS: Readonly<PhysicsConfig> = {
  gravity: 16,
  springStrength: 38,
  damping: 8.5,
  mass: 1,
  maxSwing: 112,
  dragInfluence: 1,
};

const MAX_DELTA_SECONDS = 1 / 30;

/**
 * Advances a two-axis spring-damper in place. Keeping this object mutable lets
 * the animation loop run without allocations or React renders.
 */
export function stepPhysics(
  state: PhysicsState,
  target: PhysicsTarget,
  config: PhysicsConfig,
  deltaSeconds: number,
): void {
  const dt = Math.min(Math.max(deltaSeconds, 0), MAX_DELTA_SECONDS);
  if (dt === 0) return;

  const mass = Math.max(config.mass, 0.01);
  const accelerationX =
    (-config.springStrength * (state.x - target.x) -
      config.damping * state.velocityX) /
    mass;
  const accelerationY =
    (-config.springStrength * (state.y - target.y) -
      config.damping * state.velocityY +
      config.gravity) /
    mass;

  state.velocityX += accelerationX * dt;
  state.velocityY += accelerationY * dt;
  state.x += state.velocityX * dt;
  state.y += state.velocityY * dt;

  const horizontalLimit = Math.max(config.maxSwing, 1);
  const upperLimit = -horizontalLimit * 0.32;
  const lowerLimit = horizontalLimit * 0.72;

  if (state.x < -horizontalLimit || state.x > horizontalLimit) {
    state.x = clamp(state.x, -horizontalLimit, horizontalLimit);
    state.velocityX *= -0.22;
  }
  if (state.y < upperLimit || state.y > lowerLimit) {
    state.y = clamp(state.y, upperLimit, lowerLimit);
    state.velocityY *= -0.18;
  }
}

export function isSettled(
  state: PhysicsState,
  target: PhysicsTarget,
  config: PhysicsConfig,
  tolerance = 0.08,
): boolean {
  const equilibriumY = target.y + config.gravity / config.springStrength;
  return (
    Math.abs(state.x - target.x) < tolerance &&
    Math.abs(state.y - equilibriumY) < tolerance &&
    Math.abs(state.velocityX) < tolerance &&
    Math.abs(state.velocityY) < tolerance
  );
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
