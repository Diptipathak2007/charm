import { describe, expect, it } from "vitest";
import { CHARMS, getCharm } from "./registry";

describe("charm registry", () => {
  it("contains twelve original local charms with unique IDs", () => {
    expect(CHARMS).toHaveLength(12);
    expect(new Set(CHARMS.map((charm) => charm.id)).size).toBe(CHARMS.length);
  });

  it("provides complete collection and interaction metadata", () => {
    for (const charm of CHARMS) {
      expect(charm.name.length).toBeGreaterThan(2);
      expect(charm.category.length).toBeGreaterThan(2);
      expect(charm.description.length).toBeGreaterThan(20);
      expect(charm.animation.actionLabel.length).toBeGreaterThan(4);
      expect(charm.animation.interaction).toBeTruthy();
      expect(charm.artwork).toBeTypeOf("function");
      expect(charm.defaultScale).toBeGreaterThanOrEqual(0.9);
      expect(charm.defaultScale).toBeLessThanOrEqual(1.1);
    }
  });

  it("returns Nazar as the safe fallback", () => {
    expect(getCharm("nazar").id).toBe("nazar");
    expect(getCharm("not-real" as "nazar").id).toBe("nazar");
  });
});
